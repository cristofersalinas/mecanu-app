/**
 * Conteos de KPIs del panel taller — una sola fuente para Traslados, Campañas,
 * Tareas y General. Misma regla que backoffice/analitica donde aplica.
 */
import { KPIS_RUTAS, PRESUPUESTO_PENDIENTES, type KpiRutaCfg } from './mecanu-pipeline';
import type { TareaKanban } from './pipeline-tareas';
import type { Campana, ColumnaTareaPipeline, RutaVista } from './types';

export function mismoDiaCalendario(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

/** Rutas con ventana comprometida en un día concreto (campo `fecha` de vistaRuta). */
export function trasladosVentanaEnDia(
  rutas: RutaVista[],
  dia: Date,
  { excluirCanceladas = true }: { excluirCanceladas?: boolean } = {},
): number {
  return rutas.filter((r) => {
    if (!r.fecha || !mismoDiaCalendario(r.fecha, dia)) return false;
    if (excluirCanceladas && r.estado === 'cancelado') return false;
    return true;
  }).length;
}

export function rutasPorEstado(rutas: RutaVista[], estado: RutaVista['estado']): number {
  return rutas.filter((r) => r.estado === estado).length;
}

export interface KpiTrasladoValor {
  id: string;
  label: string;
  value: string;
  delta?: string;
  dir?: 'up' | 'down';
}

export function kpisTraslados(
  rutas: RutaVista[],
  ahora: Date,
  cfg: readonly KpiRutaCfg[] = KPIS_RUTAS,
): KpiTrasladoValor[] {
  const hoyN = trasladosVentanaEnDia(rutas, ahora);
  const ayer = new Date(ahora);
  ayer.setDate(ayer.getDate() - 1);
  const ayerN = trasladosVentanaEnDia(rutas, ayer);
  const diffHoy = hoyN - ayerN;

  return cfg.map((k) => {
    if (k.hoy) {
      return {
        id: k.id,
        label: k.label,
        value: String(hoyN),
        ...(diffHoy !== 0
          ? { delta: String(Math.abs(diffHoy)), dir: diffHoy > 0 ? 'up' as const : 'down' as const }
          : {}),
      };
    }
    const n = k.estado ? rutasPorEstado(rutas, k.estado) : 0;
    return { id: k.id, label: k.label, value: String(n) };
  });
}

export interface KpiCampanaValor {
  id: string;
  label: string;
  value: string;
  iva?: boolean;
}

function totalCampana(c: Campana): number {
  return c.presupuesto?.total ?? c.valor ?? 0;
}

const ESTADOS_MONTO_ACTIVO: Campana['estado'][] = ['nueva', 'valorada', 'enviada'];

export function kpisCampanas(campanas: Campana[]): KpiCampanaValor[] {
  const pendientes = campanas.filter((c) => PRESUPUESTO_PENDIENTES.includes(c.estado));
  const enviadas = campanas.filter((c) => c.estado === 'enviada');
  const activas = campanas.filter((c) => ESTADOS_MONTO_ACTIVO.includes(c.estado));
  const aceptadas = campanas.filter((c) => c.estado === 'aceptada');
  const montoActivo = activas.reduce((a, c) => a + totalCampana(c), 0);
  const montoAceptado = aceptadas.reduce((a, c) => a + totalCampana(c), 0);

  return [
    { id: 'pendientes', label: 'Pendientes', value: String(pendientes.length) },
    { id: 'enviadas', label: 'Enviadas', value: String(enviadas.length) },
    { id: 'monto-activo', label: 'Monto activo', value: String(montoActivo), iva: true },
    { id: 'monto-aceptado', label: 'Monto aceptado', value: String(montoAceptado), iva: true },
  ];
}

export interface KpiTareaValor {
  id: string;
  label: string;
  value: string;
}

export function kpisTareas(
  porColumna: Record<ColumnaTareaPipeline, TareaKanban[]>,
): KpiTareaValor[] {
  const pendientes = porColumna.pendiente;
  return [
    { id: 'pendientes', label: 'Pendientes', value: String(pendientes.length) },
    {
      id: 'urgentes',
      label: 'Urgentes',
      value: String(pendientes.filter((t) => t.deber.urgencia === 'ahora').length),
    },
    { id: 'hechas', label: 'Hechas', value: String(porColumna.hecho.length) },
    { id: 'canceladas', label: 'Canceladas', value: String(porColumna.cancelado.length) },
  ];
}

/** Resumen de rutas para General (alineado con kpisTraslados / analitica). */
export function metricasGeneralesRutas(rutas: RutaVista[], ahora: Date) {
  const facturado = rutas
    .filter((r) => r.estado === 'completado')
    .reduce((a, r) => a + (r.importe ?? 0), 0);
  return {
    trasladosHoy: trasladosVentanaEnDia(rutas, ahora),
    enTaller: rutasPorEstado(rutas, 'en_taller'),
    enRuta: rutasPorEstado(rutas, 'en_ruta'),
    prospectos: rutasPorEstado(rutas, 'prospectos'),
    facturado,
  };
}
