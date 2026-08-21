import { fmtDinero } from '../mecanu-data';
import type { PresupuestoEstado } from '../types';
import { mismoDia, type MundoBackoffice } from './mundo';

export interface AnaliticaBackoffice {
  trasladosHoy: number;
  enRuta: number;
  enTaller: number;
  prospectos: number;
  huecosUrgentes: number;
  solicitudesPendientes: number;
  facturadoCerrado: number;
  facturadoCerradoLabel: string;
  pipelineCampanas: Record<PresupuestoEstado, { n: number; total: number; totalLabel: string }>;
  conversionEnviadaPct: number | null;
  conversionEnviadaLabel: string;
  calificacionMediaConductores: number | null;
}

const ESTADOS: PresupuestoEstado[] = [
  'nueva', 'valorada', 'enviada', 'aceptada', 'rechazada', 'caducada',
];

export function buildAnalitica(mundo: MundoBackoffice, huecosUrgentes: number): AnaliticaBackoffice {
  const { ahora, rutas, campanas, solicitudes, conductores } = mundo;
  const trasladosHoy = rutas.filter((r) => r.fecha && mismoDia(r.fecha, ahora) && r.estado !== 'cancelado').length;
  const facturadoCerrado = rutas
    .filter((r) => r.estado === 'completado')
    .reduce((a, r) => a + (r.importe ?? 0), 0);

  const pipeline = {} as AnaliticaBackoffice['pipelineCampanas'];
  for (const e of ESTADOS) {
    const list = campanas.filter((c) => c.estado === e);
    const total = list.reduce((a, c) => a + (c.presupuesto?.total ?? c.valor), 0);
    pipeline[e] = { n: list.length, total, totalLabel: fmtDinero(total) };
  }

  const enviadas = campanas.filter((c) =>
    c.estado === 'enviada' || c.estado === 'aceptada' || c.estado === 'rechazada' || c.estado === 'caducada',
  ).length;
  const aceptadas = campanas.filter((c) => c.estado === 'aceptada').length;
  const conversionEnviadaPct = enviadas === 0 ? null : Math.round((aceptadas / enviadas) * 1000) / 10;

  const calif = conductores.length
    ? conductores.reduce((a, c) => a + c.calificacion, 0) / conductores.length
    : null;

  return {
    trasladosHoy,
    enRuta: rutas.filter((r) => r.estado === 'en_ruta').length,
    enTaller: rutas.filter((r) => r.estado === 'en_taller').length,
    prospectos: rutas.filter((r) => r.estado === 'prospectos').length,
    huecosUrgentes,
    solicitudesPendientes: solicitudes.filter((s) => s.estado === 'pendiente').length,
    facturadoCerrado,
    facturadoCerradoLabel: fmtDinero(facturadoCerrado),
    pipelineCampanas: pipeline,
    conversionEnviadaPct,
    conversionEnviadaLabel: conversionEnviadaPct == null
      ? 'Sin dato: no hay ofertas enviadas'
      : `${conversionEnviadaPct.toLocaleString('es-ES')} % de las enviadas acabaron aceptadas`,
    calificacionMediaConductores: calif,
  };
}
