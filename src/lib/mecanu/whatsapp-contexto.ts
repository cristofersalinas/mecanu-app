/**
 * Contexto de atención al cliente en la sidebar de WhatsApp.
 * Historial, próximos traslados, documentos/check-in y link de seguimiento.
 */
import { ESTADO, subestadoMeta } from './mecanu-pipeline';
import type { Campana, Cliente, Conductor, Inspeccion, RutaVista } from './types';

export const ESTADOS_RUTA_ACTIVOS = new Set([
  'prospectos',
  'agendado',
  'en_ruta',
  'en_taller',
]);

export interface CampoFichaWa {
  key: 'nombre' | 'email' | 'direccion' | 'telefono';
  label: string;
  valor: string;
  faltante: boolean;
  editable: boolean;
}

export interface TrasladoResumenWa {
  rutaId: string;
  servicio: string;
  estadoId: string;
  estadoLabel: string;
  subestadoLabel: string;
  ventana: string;
  conductorNombre: string | null;
  seguro: boolean;
  linkSeguimiento: string | null;
  checkins: number;
  tieneDocumentos: boolean;
  vehiculoListo: boolean | null;
}

export interface HistorialItemWa {
  rutaId: string;
  servicio: string;
  estadoLabel: string;
  fechaLabel: string;
  importeLabel: string | null;
}

export interface CampanaResumenWa {
  id: string;
  falla: string;
  estado: string;
  valorLabel: string;
}

export interface ContextoContactoWa {
  cliente: Cliente | null;
  campos: CampoFichaWa[];
  faltantes: string[];
  historial: HistorialItemWa[];
  proximos: TrasladoResumenWa[];
  campanas: CampanaResumenWa[];
  /** Propuesta de URL pública; la página aún no está en producción. */
  linkSeguimientoActivo: string | null;
  notaSeguimiento: string;
}

/** URL pública propuesta para el cliente (profundizamos la página después). */
export function urlSeguimientoRuta(token: string | null | undefined, origin = 'https://mecanu.com'): string | null {
  if (!token?.trim()) return null;
  return `${origin.replace(/\/$/, '')}/s/${encodeURIComponent(token.trim())}`;
}

/** Misma ruta pública, abierta en la pestaña Presupuesto (cotización interactiva). */
export function urlSeguimientoPresupuesto(
  token: string | null | undefined,
  origin = 'https://mecanu.com',
): string | null {
  const base = urlSeguimientoRuta(token, origin);
  return base ? `${base}?vista=presupuesto` : null;
}

function fmtDinero(n: number): string {
  return (
    n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
  );
}

function fmtFechaCorta(d: Date | null | undefined): string {
  if (!d) return 'Sin fecha';
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function labelEstado(estadoId: string): string {
  return ESTADO[estadoId]?.label ?? estadoId;
}

function labelSubestado(estadoId: string, subestado: string): string {
  return subestadoMeta(estadoId, subestado)?.label ?? subestado;
}

export function camposFichaCliente(
  cliente: Cliente | null,
  telefonoWa: string,
): CampoFichaWa[] {
  const tel = (cliente?.telefono || telefonoWa || '').trim();
  const nombre = (cliente?.nombre || '').trim();
  const email = (cliente?.email || '').trim();
  const direccion = (cliente?.direccion || '').trim();
  return [
    {
      key: 'nombre',
      label: 'Nombre',
      valor: nombre,
      faltante: !nombre || /^569\d+$/.test(nombre.replace(/\D/g, '')) || nombre === tel,
      editable: true,
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      valor: tel,
      faltante: !tel,
      editable: false,
    },
    {
      key: 'email',
      label: 'Correo',
      valor: email,
      faltante: !email,
      editable: true,
    },
    {
      key: 'direccion',
      label: 'Dirección',
      valor: direccion,
      faltante: !direccion,
      editable: true,
    },
  ];
}

export function resumenTrasladoWa(
  r: RutaVista,
  conductores: Conductor[],
  inspecciones: Inspeccion[],
  origin?: string,
): TrasladoResumenWa {
  const cond = r.conductorId ? conductores.find((d) => d.id === r.conductorId) : null;
  const ventana =
    r.franja && r.fecha
      ? `${fmtFechaCorta(r.fecha)} · ${r.franja}`
      : r.franjaPropuesta
        ? `Propuesta: ${fmtFechaCorta(r.fechaPropuesta)} · ${r.franjaPropuesta}`
        : 'Pendiente de agendar';
  return {
    rutaId: r.id,
    servicio: r.descripcionServicio || 'Traslado',
    estadoId: r.estado,
    estadoLabel: labelEstado(r.estado),
    subestadoLabel: labelSubestado(r.estado, r.subestado),
    ventana,
    conductorNombre: cond?.nombre ?? null,
    seguro: r.seguro,
    linkSeguimiento: urlSeguimientoRuta(r.linkToken, origin),
    checkins: inspecciones.filter((i) => i.tipo === 'check-in' || i.tipo === 'check-out').length,
    tieneDocumentos: inspecciones.length > 0,
    vehiculoListo: r.vehiculoListo,
  };
}

export function construirContextoContactoWa(opts: {
  telefono: string;
  cliente: Cliente | null;
  rutas: RutaVista[];
  campanas: Campana[];
  conductores: Conductor[];
  inspeccionesPorRuta: Record<string, Inspeccion[]>;
  origin?: string;
}): ContextoContactoWa {
  const { cliente, telefono, rutas, campanas, conductores, inspeccionesPorRuta, origin } = opts;
  const campos = camposFichaCliente(cliente, telefono);
  const propias = cliente
    ? rutas.filter((r) => r.clienteId === cliente.id)
    : [];

  const proximos = propias
    .filter((r) => ESTADOS_RUTA_ACTIVOS.has(r.estado))
    .sort((a, b) => {
      const ta = a.fecha?.getTime() ?? a.fechaPropuesta?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const tb = b.fecha?.getTime() ?? b.fechaPropuesta?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return ta - tb;
    })
    .map((r) => resumenTrasladoWa(r, conductores, inspeccionesPorRuta[r.id] ?? [], origin));

  const historial = propias
    .filter((r) => r.estado === 'completado' || r.estado === 'cancelado')
    .sort((a, b) => (b.creadaEn?.getTime() ?? 0) - (a.creadaEn?.getTime() ?? 0))
    .slice(0, 8)
    .map(
      (r): HistorialItemWa => ({
        rutaId: r.id,
        servicio: r.descripcionServicio || 'Orden',
        estadoLabel: labelEstado(r.estado),
        fechaLabel: fmtFechaCorta(r.fecha ?? r.creadaEn),
        importeLabel: r.importe != null ? fmtDinero(r.importe) : null,
      }),
    );

  const camps = (cliente ? campanas.filter((c) => c.clienteId === cliente.id) : [])
    .slice()
    .sort((a, b) => (b.fecha?.getTime() ?? 0) - (a.fecha?.getTime() ?? 0))
    .slice(0, 5)
    .map(
      (c): CampanaResumenWa => ({
        id: c.id,
        falla: c.falla,
        estado: c.estado,
        valorLabel: fmtDinero(c.valor),
      }),
    );

  const linkSeguimientoActivo =
    proximos.find((p) => p.linkSeguimiento)?.linkSeguimiento ??
    propias.map((r) => urlSeguimientoRuta(r.linkToken, origin)).find(Boolean) ??
    null;

  return {
    cliente,
    campos,
    faltantes: campos.filter((c) => c.faltante && c.editable).map((c) => c.label),
    historial,
    proximos,
    campanas: camps,
    linkSeguimientoActivo,
    notaSeguimiento:
      'El cliente abre /s/{token} en el móvil: estado del viaje, ventana, conductor y seguro. Puedes copiar el enlace y enviarlo por chat.',
  };
}

/** Solo rellena huecos: no pisa un valor existente con vacío. */
export function fusionarFichaParcial(
  actual: Pick<Cliente, 'nombre' | 'email' | 'direccion' | 'telefono'>,
  patch: Partial<Pick<Cliente, 'nombre' | 'email' | 'direccion'>>,
): Partial<Pick<Cliente, 'nombre' | 'email' | 'direccion'>> {
  const out: Partial<Pick<Cliente, 'nombre' | 'email' | 'direccion'>> = {};
  if (typeof patch.nombre === 'string') {
    const n = patch.nombre.trim();
    if (n) out.nombre = n.slice(0, 120);
  }
  if (typeof patch.email === 'string') {
    const e = patch.email.trim();
    if (e) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        throw new Error('Correo no válido');
      }
      out.email = e.slice(0, 160);
    } else if (!actual.email?.trim()) {
      out.email = '';
    }
  }
  if (typeof patch.direccion === 'string') {
    const d = patch.direccion.trim();
    if (d) out.direccion = d.slice(0, 240);
    else if (!actual.direccion?.trim()) out.direccion = '';
  }
  return out;
}
