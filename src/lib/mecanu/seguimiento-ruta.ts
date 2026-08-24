/**
 * Vista pública de seguimiento de ruta (`/s/{token}`).
 * Timeline tipo envío + presupuesto + check-in (o aviso si aún no hay).
 */
import { ESTADO, ESTADOS_TRAMO, ORIGEN_LINEA, ROLES_TRAMO, subestadoMeta } from './mecanu-pipeline';
import type {
  Actividad,
  Conductor,
  Inspeccion,
  Parada,
  Presupuesto,
  RutaVista,
  Tramo,
  Vehiculo,
} from './types';

export interface PasoSeguimiento {
  id: string;
  label: string;
  estado: 'hecho' | 'actual' | 'pendiente';
}

export interface EventoTimelinePublico {
  id: string;
  ts: string | null;
  horaLabel: string;
  titulo: string;
  detalle: string | null;
  estado: 'hecho' | 'actual' | 'pendiente';
  tipo: 'estado' | 'gps' | 'checkin' | 'checkout' | 'comunicacion' | 'previsto' | 'incidencia';
}

export interface TramoPublico {
  id: string;
  rol: string;
  rolLabel: string;
  estadoLabel: string;
  subestadoLabel: string | null;
  ventanaLabel: string;
  origenLabel: string;
  destinoLabel: string;
  origenEtiqueta: string | null;
  destinoEtiqueta: string | null;
  origenDireccion: string | null;
  destinoDireccion: string | null;
  llegadaRealLabel: string | null;
  salidaRealLabel: string | null;
  activo: boolean;
}

export interface LineaPresupuestoPublica {
  descripcion: string;
  importeLabel: string;
  origenLabel: string;
  esTraslado: boolean;
}

export interface PresupuestoPublico {
  modo: string;
  soloTraslado: boolean;
  totalLabel: string;
  ivaIncluido: boolean;
  lineas: LineaPresupuestoPublica[];
  nota: string;
}

export interface CheckinPublico {
  disponible: boolean;
  pendienteMensaje: string | null;
  id: string | null;
  tipoLabel: string | null;
  fechaLabel: string | null;
  inspectorNombre: string | null;
  km: number | null;
  combustible: string | null;
  combustiblePct: number | null;
  limpieza: string | null;
  danos: { zona: string; tipo: string; descripcion: string; fotoUrl: string | null }[];
  hallazgos: { item: string; metrica: string; severidad: string; fotoUrl: string | null }[];
  firmaConductor: boolean;
  firmaCliente: boolean;
}

export interface SeguimientoPublico {
  token: string;
  rutaId: string;
  tallerNombre: string;
  vehiculoLabel: string;
  servicio: string;
  estadoId: string;
  estadoLabel: string;
  subestadoLabel: string;
  ventanaLabel: string;
  conductorLabel: string | null;
  seguro: boolean;
  seguroLabel: string;
  etiquetaOrigen: string | null;
  etiquetaDestino: string | null;
  direccionOrigen: string | null;
  direccionDestino: string | null;
  origenCorto: string | null;
  destinoCorto: string | null;
  pasos: PasoSeguimiento[];
  mensaje: string;
  progresoPct: number;
  tramos: TramoPublico[];
  timeline: EventoTimelinePublico[];
  presupuesto: PresupuestoPublico | null;
  checkin: CheckinPublico;
  actualizadoLabel: string;
}

/** Nombre parcial para no exponer apellidos completos en enlace público. */
export function nombreConductorPublico(nombre: string | null | undefined): string | null {
  if (!nombre?.trim()) return null;
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];
  const inicial = parts[1][0]?.toUpperCase() ?? '';
  return inicial ? `${parts[0]} ${inicial}.` : parts[0];
}

/** Acorta dirección: localidad o últimos segmentos. */
export function direccionCorta(dir: string | null | undefined): string | null {
  if (!dir?.trim()) return null;
  const parts = dir.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return parts.slice(-2).join(', ');
  return parts[0] ?? null;
}

export function etiquetaVehiculoPublico(v: Pick<Vehiculo, 'marca' | 'modelo' | 'matricula'> | null): string {
  if (!v) return 'Tu vehículo';
  return `${v.marca} ${v.modelo} · ${v.matricula}`;
}

function fmtFecha(d: Date | null | undefined): string {
  if (!d) return '';
  return d.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function fmtHora(d: Date | null | undefined): string {
  if (!d) return '';
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function fmtFechaHora(d: Date | null | undefined): string {
  if (!d) return '—';
  return `${fmtFecha(d)} · ${fmtHora(d)}`;
}

function fmtDinero(n: number): string {
  return (
    n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
  );
}

export function ventanaPublica(r: Pick<RutaVista, 'fecha' | 'franja' | 'fechaPropuesta' | 'franjaPropuesta'>): string {
  if (r.fecha && r.franja) return `${fmtFecha(r.fecha)} · ${r.franja}`;
  if (r.franjaPropuesta) {
    return `Propuesta: ${fmtFecha(r.fechaPropuesta)} · ${r.franjaPropuesta}`;
  }
  return 'Pendiente de agendar';
}

const PASOS_PIPELINE = ['prospectos', 'agendado', 'en_ruta', 'en_taller', 'completado'] as const;

export function pasosSeguimiento(estadoId: string): PasoSeguimiento[] {
  if (estadoId === 'cancelado') {
    const base: PasoSeguimiento[] = PASOS_PIPELINE.map((id) => ({
      id,
      label: ESTADO[id]?.label ?? id,
      estado: 'pendiente',
    }));
    base.push({ id: 'cancelado', label: 'Cancelado', estado: 'actual' });
    return base;
  }
  const idx = PASOS_PIPELINE.indexOf(estadoId as (typeof PASOS_PIPELINE)[number]);
  return PASOS_PIPELINE.map((id, i) => {
    let estado: PasoSeguimiento['estado'] = 'pendiente';
    if (idx < 0) estado = 'pendiente';
    else if (i < idx) estado = 'hecho';
    else if (i === idx) estado = 'actual';
    return { id, label: ESTADO[id]?.label ?? id, estado };
  });
}

export function progresoPorcentaje(estadoId: string): number {
  if (estadoId === 'cancelado') return 0;
  const idx = PASOS_PIPELINE.indexOf(estadoId as (typeof PASOS_PIPELINE)[number]);
  if (idx < 0) return 8;
  return Math.round(((idx + 0.55) / PASOS_PIPELINE.length) * 100);
}

export function mensajeSeguimiento(estadoId: string, subestado: string): string {
  if (estadoId === 'cancelado') return 'Este traslado se ha cancelado. Si tienes dudas, escribe al taller.';
  if (estadoId === 'completado') return 'Traslado terminado. Gracias por confiar en el taller.';
  if (estadoId === 'en_taller') return 'Tu coche está en el taller. Te avisaremos cuando salga de vuelta.';
  if (estadoId === 'en_ruta') {
    const sub = subestadoMeta(estadoId, subestado)?.label;
    return sub ? `En ruta: ${sub.toLowerCase()}.` : 'El conductor está en ruta con tu vehículo.';
  }
  if (estadoId === 'agendado') return 'Todo listo: ventana y conductor confirmados. Te avisamos si cambia algo.';
  return 'Estamos organizando tu traslado.';
}

function etiquetaParadaPublica(p: Parada | null | undefined): string {
  if (!p) return '—';
  const corto = direccionCorta(p.direccion);
  if (p.tipo === 'cliente') return corto ? `Domicilio · ${corto}` : 'Domicilio';
  return p.etiqueta || corto || 'Taller';
}

function etiquetaTipoParada(p: Parada | null | undefined): string | null {
  if (!p) return null;
  if (p.etiqueta?.trim()) return p.etiqueta.trim();
  if (p.tipo === 'cliente') return 'Domicilio';
  if (p.subtipo === 'itv') return 'ITV';
  if (p.subtipo === 'chapista') return 'Chapista';
  return 'Taller';
}

function ventanaTramoLabel(t: Tramo): string {
  if (t.ventana) {
    return `${fmtFecha(t.ventana.fecha)} · ${t.ventana.inicio} – ${t.ventana.fin}`;
  }
  if (t.ventanaPropuesta) {
    return `Propuesta: ${fmtFecha(t.ventanaPropuesta.fecha)} · ${t.ventanaPropuesta.inicio} – ${t.ventanaPropuesta.fin}`;
  }
  return 'Pendiente de agendar';
}

export function tramosPublicos(
  tramos: Tramo[],
  paradas: Parada[],
  tramoActivoId: string | null,
): TramoPublico[] {
  const byId = new Map(paradas.map((p) => [p.id, p]));
  return tramos.map((t) => {
    const o = t.paradaOrigenId ? byId.get(t.paradaOrigenId) : null;
    const d = t.paradaDestinoId ? byId.get(t.paradaDestinoId) : null;
    return {
      id: t.id,
      rol: t.rol,
      rolLabel: ROLES_TRAMO[t.rol]?.label ?? t.rol,
      estadoLabel: ESTADOS_TRAMO[t.estado]?.label ?? t.estado,
      subestadoLabel: t.subestado
        ? (subestadoMeta('en_ruta', t.subestado)?.label ?? t.subestado)
        : null,
      ventanaLabel: ventanaTramoLabel(t),
      origenLabel: etiquetaParadaPublica(o),
      destinoLabel: etiquetaParadaPublica(d),
      origenEtiqueta: etiquetaTipoParada(o),
      destinoEtiqueta: etiquetaTipoParada(d),
      origenDireccion: o?.direccion?.trim() || null,
      destinoDireccion: d?.direccion?.trim() || null,
      llegadaRealLabel: d?.llegadaReal ? fmtFechaHora(d.llegadaReal) : null,
      salidaRealLabel: o?.salidaReal ? fmtFechaHora(o.salidaReal) : null,
      activo: t.id === tramoActivoId || t.estado === 'en_curso',
    };
  });
}

function tipoEventoDeActividad(a: Actividad): EventoTimelinePublico['tipo'] {
  if (a.tipoEvidencia === 'check-in') return 'checkin';
  if (a.tipoEvidencia === 'check-out' || a.tipoEvidencia === 'entrega') return 'checkout';
  if (a.tipo === 'gps') return 'gps';
  if (a.tipo === 'comunicacion') return 'comunicacion';
  if (a.tipo === 'incidencia') return 'incidencia';
  return 'estado';
}

export function timelineDesdeActividad(
  actividad: Actividad[],
  tramos: Tramo[],
  checkin: Inspeccion | null,
): EventoTimelinePublico[] {
  const hechos: EventoTimelinePublico[] = actividad
    .slice()
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
    .map((a) => ({
      id: a.id,
      ts: a.fecha.toISOString(),
      horaLabel: fmtFechaHora(a.fecha),
      titulo: a.label,
      detalle: a.detalle,
      estado: 'hecho' as const,
      tipo: tipoEventoDeActividad(a),
    }));

  if (checkin) {
    const ya = hechos.some((e) => e.tipo === 'checkin' || e.tipo === 'checkout');
    if (!ya) {
      hechos.push({
        id: `chk-${checkin.id}`,
        ts: checkin.fecha.toISOString(),
        horaLabel: fmtFechaHora(checkin.fecha),
        titulo: checkin.tipo === 'check-out' ? 'Check-out registrado' : 'Check-in registrado',
        detalle: `${checkin.km.toLocaleString('es-ES')} km · combustible ${checkin.combustible}`,
        estado: 'hecho',
        tipo: checkin.tipo === 'check-out' ? 'checkout' : 'checkin',
      });
      hechos.sort((a, b) => (a.ts ?? '').localeCompare(b.ts ?? ''));
    }
  }

  const previstos: EventoTimelinePublico[] = [];
  const ida = tramos.find((t) => t.rol === 'ida');
  const vuelta = tramos.find((t) => t.rol === 'vuelta');

  if (ida && ida.estado !== 'completado' && ida.estado !== 'cancelado') {
    if (!checkin || checkin.tipo !== 'check-in') {
      previstos.push({
        id: 'prev-checkin',
        ts: null,
        horaLabel: 'Pendiente',
        titulo: 'Check-in en la recogida',
        detalle:
          'Aún no hay registro. Cuando el conductor recoja el vehículo verás km, combustible, fotos y firma aquí.',
        estado: 'pendiente',
        tipo: 'previsto',
      });
    }
    if (ida.estado === 'en_curso' || ida.estado === 'agendado') {
      previstos.push({
        id: 'prev-llegada-taller',
        ts: null,
        horaLabel: ida.ventana ? `Previsto · ${ida.ventana.fin}` : 'Pendiente',
        titulo: 'Llegada al taller',
        detalle: 'Te avisamos al entregar el coche en el taller.',
        estado: ida.estado === 'en_curso' ? 'actual' : 'pendiente',
        tipo: 'previsto',
      });
    }
  }

  if (vuelta && vuelta.estado !== 'completado' && vuelta.estado !== 'cancelado') {
    previstos.push({
      id: 'prev-vuelta',
      ts: null,
      horaLabel: vuelta.ventana
        ? `${fmtFecha(vuelta.ventana.fecha)} · ${vuelta.ventana.inicio} – ${vuelta.ventana.fin}`
        : 'Pendiente de agendar',
      titulo: 'Vuelta a domicilio',
      detalle: 'Entrega del vehículo en tu dirección cuando el taller termine.',
      estado: 'pendiente',
      tipo: 'previsto',
    });
  }

  if (hechos.length && !previstos.some((p) => p.estado === 'actual')) {
    const last = hechos[hechos.length - 1]!;
    if (ida?.estado === 'en_curso') last.estado = 'actual';
  }

  return [...hechos, ...previstos];
}

export function presupuestoPublico(pres: Presupuesto | null | undefined): PresupuestoPublico | null {
  if (!pres || !pres.lineas.length) return null;
  const lineas = pres.lineas.map((l) => ({
    descripcion: l.descripcion,
    importeLabel: fmtDinero(l.importe),
    origenLabel: ORIGEN_LINEA[l.origen]?.label ?? l.origen,
    esTraslado: l.origen === 'traslado',
  }));
  const soloTraslado = lineas.every((l) => l.esTraslado);
  return {
    modo: pres.modo,
    soloTraslado,
    totalLabel: fmtDinero(pres.total),
    ivaIncluido: pres.ivaIncluido,
    lineas,
    nota: soloTraslado
      ? 'Este presupuesto incluye solo los traslados. La reparación se gestionó aparte o aún no está valorada en Mecanu.'
      : 'Importes con IVA incluido. El total incluye reparación y traslados.',
  };
}

export function checkinPublico(
  inspecciones: Inspeccion[],
  estadoRuta: string,
): CheckinPublico {
  const pendienteMensaje =
    'El conductor aún no ha registrado el check-in. En cuanto recoja el vehículo verás aquí el estado (km, combustible, daños y fotos).';
  const chk =
    inspecciones.find((i) => i.tipo === 'check-in') ??
    inspecciones.find((i) => i.tipo === 'check-out') ??
    null;

  if (!chk) {
    const esperaCheckin =
      estadoRuta === 'agendado' ||
      estadoRuta === 'en_ruta' ||
      estadoRuta === 'prospectos' ||
      estadoRuta === 'en_taller';
    return {
      disponible: false,
      pendienteMensaje: esperaCheckin ? pendienteMensaje : null,
      id: null,
      tipoLabel: null,
      fechaLabel: null,
      inspectorNombre: null,
      km: null,
      combustible: null,
      combustiblePct: null,
      limpieza: null,
      danos: [],
      hallazgos: [],
      firmaConductor: false,
      firmaCliente: false,
    };
  }

  return {
    disponible: true,
    pendienteMensaje: null,
    id: chk.id,
    tipoLabel: chk.tipo === 'check-out' ? 'Check-out' : 'Check-in',
    fechaLabel: fmtFechaHora(chk.fecha),
    inspectorNombre: nombreConductorPublico(chk.inspectorNombre),
    km: chk.km,
    combustible: chk.combustible,
    combustiblePct: chk.combustiblePct,
    limpieza: chk.limpieza,
    danos: chk.danos.map((d) => ({
      zona: d.zona,
      tipo: d.tipo,
      descripcion: d.descripcion,
      fotoUrl: d.fotoUrl ?? d.foto,
    })),
    hallazgos: chk.hallazgos.map((h) => ({
      item: h.item,
      metrica: h.metrica,
      severidad: h.severidad,
      fotoUrl: h.fotoUrl ?? h.foto,
    })),
    firmaConductor: Boolean(chk.firmas.conductor),
    firmaCliente: Boolean(chk.firmas.cliente),
  };
}

export function construirSeguimientoPublico(opts: {
  token: string;
  ruta: RutaVista | null | undefined;
  vehiculo: Vehiculo | null;
  conductor: Conductor | null;
  tallerNombre: string;
  tramos?: Tramo[];
  paradas?: Parada[];
  actividad?: Actividad[];
  inspecciones?: Inspeccion[];
  presupuesto?: Presupuesto | null;
}): SeguimientoPublico | null {
  const { token, ruta, vehiculo, conductor, tallerNombre } = opts;
  if (!ruta || !ruta.linkToken || ruta.linkToken !== token) return null;

  const estadoLabel = ESTADO[ruta.estado]?.label ?? ruta.estado;
  const subestadoLabel = subestadoMeta(ruta.estado, ruta.subestado)?.label ?? ruta.subestado;
  const tramos = opts.tramos ?? [];
  const paradas = opts.paradas ?? [];
  const actividad = opts.actividad ?? [];
  const inspecciones = opts.inspecciones ?? [];
  const checkin = checkinPublico(inspecciones, ruta.estado);
  const chkInsp = inspecciones.find((i) => i.tipo === 'check-in') ?? null;

  const ultAct = actividad[0]?.fecha ?? chkInsp?.fecha ?? ruta.creadaEn;

  return {
    token,
    rutaId: ruta.id,
    tallerNombre,
    vehiculoLabel: etiquetaVehiculoPublico(vehiculo),
    servicio: ruta.descripcionServicio || 'Traslado',
    estadoId: ruta.estado,
    estadoLabel,
    subestadoLabel,
    ventanaLabel: ventanaPublica(ruta),
    conductorLabel: nombreConductorPublico(conductor?.nombre),
    seguro: ruta.seguro,
    seguroLabel: ruta.seguro ? 'Cobertura de seguro incluida' : 'Sin cobertura de seguro en este tramo',
    etiquetaOrigen: ruta.etiquetaOrigen ?? etiquetaTipoParada(ruta.paradaOrigen),
    etiquetaDestino: ruta.etiquetaDestino ?? etiquetaTipoParada(ruta.paradaDestino),
    direccionOrigen: ruta.direccionOrigen?.trim() || null,
    direccionDestino: ruta.direccionDestino?.trim() || null,
    origenCorto: direccionCorta(ruta.direccionOrigen),
    destinoCorto: direccionCorta(ruta.direccionDestino),
    pasos: pasosSeguimiento(ruta.estado),
    mensaje: mensajeSeguimiento(ruta.estado, ruta.subestado),
    progresoPct: progresoPorcentaje(ruta.estado),
    tramos: tramosPublicos(tramos, paradas, ruta.tramoActivoId),
    timeline: timelineDesdeActividad(actividad, tramos, chkInsp),
    presupuesto: presupuestoPublico(opts.presupuesto ?? ruta.presupuesto),
    checkin,
    actualizadoLabel: ultAct ? `Actualizado ${fmtFechaHora(ultAct)}` : 'Sin eventos registrados aún',
  };
}

/** Busca la ruta por token en una lista ya cargada. */
export function rutaPorLinkToken(rutas: RutaVista[], token: string): RutaVista | null {
  const t = token.trim();
  if (!t) return null;
  return rutas.find((r) => r.linkToken === t) ?? null;
}
