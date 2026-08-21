/**
 * Construye una ruta completa (paradas + tramo ida + presupuesto) desde una campaña
 * aceptada. Lógica pura: el mock y el futuro repo-supabase la usan igual.
 * Decisión de producto #9 (CLAUDE.md): tal cual / editar líneas / solo total;
 * con fecha → AGENDADO; sin fecha → PROSPECTOS. Total incluye línea de traslado.
 */
import { localizarDireccion, TALLER } from './mecanu-data';
import { etiquetaParada, ROLES_TRAMO, SERVICIO_TRASLADO_ID } from './mecanu-pipeline';
import type {
  Campana,
  LineaPresupuesto,
  OrigenLinea,
  Parada,
  Presupuesto,
  Ruta,
  Tramo,
} from './types';
import type { CrearRutaDesdeCampanaInput } from './repo/repo';

export interface RutaDesdeCampanaResultado {
  ruta: Ruta;
  paradas: Parada[];
  tramos: Tramo[];
  presupuesto: Presupuesto;
}

export interface CrearRutaDesdeCampanaDeps {
  /** Genera el id de ruta (p. ej. TR-1100). */
  nextRutaId: () => string;
  /** Importe del traslado ida si no viene en las líneas. */
  importeTrasladoIda?: number;
  ahora?: Date;
  direccionTaller?: string;
  direccionCliente?: string | null;
}

function redondear(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseFranja(franja: string | null): { inicio: string; fin: string } | null {
  if (!franja) return null;
  const parts = franja.split(/\s*-\s*/).map((s) => s.trim());
  if (parts.length < 2 || !parts[0] || !parts[1]) return null;
  return { inicio: parts[0], fin: parts[1] };
}

function normalizarLineas(
  input: CrearRutaDesdeCampanaInput,
  campana: Campana,
): LineaPresupuesto[] {
  if (input.modo === 'solo_total') {
    const total = input.lineas?.reduce((a, l) => a + l.importe, 0)
      ?? campana.presupuesto.total;
    return [{
      descripcion: 'Presupuesto cerrado (sin desglose)',
      importe: redondear(total),
      origen: 'manual',
      servicioTemparioId: null,
    }];
  }
  if (input.modo === 'editar_lineas' && input.lineas?.length) {
    return input.lineas.map((l) => ({
      descripcion: l.descripcion,
      importe: redondear(l.importe),
      origen: (l.origen as OrigenLinea) || 'manual',
      servicioTemparioId: null,
    }));
  }
  // tal_cual: copia del presupuesto de la campaña
  return campana.presupuesto.lineas.map((l) => ({ ...l }));
}

function asegurarLineaTraslado(
  lineas: LineaPresupuesto[],
  importeIda: number,
  etiquetaOrigen: string,
  etiquetaDestino: string,
): LineaPresupuesto[] {
  if (lineas.some((l) => l.origen === 'traslado')) return lineas;
  return [
    ...lineas,
    {
      descripcion: `Traslado ${ROLES_TRAMO.ida.corto.toLowerCase()} · ${etiquetaOrigen} → ${etiquetaDestino}`,
      importe: redondear(importeIda),
      origen: 'traslado',
      servicioTemparioId: SERVICIO_TRASLADO_ID,
    },
  ];
}

export function crearRutaDesdeCampana(
  campana: Campana,
  input: CrearRutaDesdeCampanaInput,
  deps: CrearRutaDesdeCampanaDeps,
): RutaDesdeCampanaResultado {
  if (input.campanaId !== campana.id) {
    throw new Error(`campanaId no coincide: ${input.campanaId} vs ${campana.id}`);
  }

  const ahora = deps.ahora ?? new Date();
  const rutaId = deps.nextRutaId();
  const num = rutaId.replace(/^TR-/, '');
  const conFecha = !!input.fecha;
  const dirTaller = deps.direccionTaller ?? TALLER.direccion;
  const dirCli = deps.direccionCliente ?? null;
  const importeIda = deps.importeTrasladoIda ?? 45;

  const locCli = localizarDireccion(dirCli);
  const locTall = localizarDireccion(dirTaller);

  const paradaCasa: Parada = {
    id: `PD-${num}-1`,
    rutaId,
    orden: 1,
    tipo: 'cliente',
    subtipo: null,
    etiqueta: 'Casa',
    direccion: dirCli,
    localidad: locCli.localidad,
    sublocalidad: locCli.sublocalidad,
    servicios: [],
    llegadaReal: null,
    salidaReal: null,
  };

  const paradaTaller: Parada = {
    id: `PD-${num}-2`,
    rutaId,
    orden: 2,
    tipo: 'proveedor',
    subtipo: 'taller',
    etiqueta: etiquetaParada({ tipo: 'proveedor', subtipo: 'taller' }),
    direccion: dirTaller,
    localidad: locTall.localidad,
    sublocalidad: locTall.sublocalidad,
    servicios: [{ descripcion: input.tipoServicio || campana.falla, presupuestoId: `PR-${rutaId}` }],
    llegadaReal: null,
    salidaReal: null,
  };

  const franja = parseFranja(input.franja);
  const ventana = conFecha && input.fecha && franja
    ? { fecha: input.fecha, inicio: franja.inicio, fin: franja.fin }
    : null;

  const tramo: Tramo = {
    id: `TS-${num}-1`,
    rutaId,
    orden: 1,
    rol: 'ida',
    paradaOrigenId: paradaCasa.id,
    paradaDestinoId: paradaTaller.id,
    conductorId: null,
    ventana,
    ventanaPropuesta: null,
    ventanaModo: conFecha ? 'fija_taller' : null,
    clienteConfirmo: null,
    estado: conFecha ? 'agendado' : 'sin_agenda',
    subestado: null,
    seguro: true,
    importe: importeIda,
    reprogramaciones: 0,
    comunicaAlCliente: true,
  };

  let lineas = normalizarLineas(input, campana);
  lineas = asegurarLineaTraslado(
    lineas,
    importeIda,
    etiquetaParada(paradaCasa),
    etiquetaParada(paradaTaller),
  );
  const total = redondear(lineas.reduce((a, l) => a + l.importe, 0));

  const presupuesto: Presupuesto = {
    id: `PR-${rutaId}`,
    campanaId: campana.id,
    vehiculoId: campana.vehiculoId,
    rutaOrigenId: campana.rutaOrigenId,
    rutaGeneradaId: rutaId,
    modo: input.modo === 'solo_total' ? 'solo_total' : 'detallado',
    lineas,
    estado: 'aceptada',
    ivaIncluido: true,
    creado: ahora,
    actualizado: ahora,
    total,
  };

  const ruta: Ruta = {
    id: rutaId,
    vehiculoId: campana.vehiculoId,
    clienteId: campana.clienteId,
    perfilServicio: 'estimable',
    modeloPrecio: 'paquete',
    precioTotal: total,
    estado: conFecha ? 'agendado' : 'prospectos',
    subestado: conFecha ? 'sin_conductor' : 'sin_fecha',
    tagsManual: [],
    clienteTieneAuto: null,
    vehiculoListo: null,
    campanaOrigenId: campana.id,
    presupuestoId: presupuesto.id,
    motivo: null,
    canceladaEn: null,
    incidencia: null,
    matriculaLead: null,
    linkToken: null,
    linkEnviadoEn: null,
    creadaEn: ahora,
  };

  return { ruta, paradas: [paradaCasa, paradaTaller], tramos: [tramo], presupuesto };
}
