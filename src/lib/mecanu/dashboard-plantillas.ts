/**
 * Plantillas de sistema del dashboard General.
 * `operacion` = default: KPIs arriba + citas|mapa hero + bloques abajo.
 */
import type { Dashboard, DashboardWidget } from './dashboard-types';

function w(
  id: string,
  metricaId: string,
  tipo: DashboardWidget['tipo'],
  viz: DashboardWidget['viz'],
  layout: DashboardWidget['layout'],
  titulo?: string,
): DashboardWidget {
  return { id, metricaId, tipo, viz, layout, titulo };
}

/** Layout default: franja KPIs + hero citas(4)+mapa(8) + resto. */
export function widgetsPlantillaOperacion(): DashboardWidget[] {
  return [
    w('op-kpis-gen', 'kpis_generales', 'kpis_generales', 'kpi_grupo', { x: 0, y: 0, w: 12, h: 5 }, 'Resumen'),
    w('op-citas', 'proximas_citas', 'proximas_citas', 'lista', { x: 0, y: 5, w: 4, h: 18 }, 'Próximas citas'),
    w('op-mapa', 'flota_mapa', 'flota_mapa', 'mapa', { x: 4, y: 5, w: 8, h: 18 }, 'Flota alrededor del taller'),
    w('op-traslados', 'kpis_traslados', 'kpis_traslados', 'kpi_grupo', { x: 0, y: 23, w: 12, h: 5 }, 'Traslados'),
    w('op-tareas', 'kpis_tareas', 'kpis_tareas', 'kpi_grupo', { x: 0, y: 28, w: 12, h: 5 }, 'Tareas'),
    w('op-campanas', 'kpis_campanas', 'kpis_campanas', 'kpi_grupo', { x: 0, y: 33, w: 12, h: 5 }, 'Campañas'),
    w('op-barras', 'servicios_barras', 'servicios_barras', 'barras', { x: 0, y: 38, w: 12, h: 8 }, 'Servicios de traslado'),
    w('op-ind', 'indicadores_traslado', 'indicadores_traslado', 'tiles', { x: 0, y: 46, w: 6, h: 8 }, 'Indicadores de traslado'),
    w('op-rank', 'ranking', 'ranking', 'ranking', { x: 6, y: 46, w: 6, h: 8 }, 'Ranking'),
  ];
}

export function widgetsPlantillaComercial(): DashboardWidget[] {
  return [
    w('co-kpis-gen', 'kpis_generales', 'kpis_generales', 'kpi_grupo', { x: 0, y: 0, w: 12, h: 5 }, 'Resumen'),
    w('co-campanas', 'kpis_campanas', 'kpis_campanas', 'kpi_grupo', { x: 0, y: 5, w: 12, h: 5 }, 'Campañas'),
    w('co-barras', 'servicios_barras', 'servicios_barras', 'barras', { x: 0, y: 10, w: 8, h: 8 }, 'Servicios'),
    w('co-rank', 'ranking', 'ranking', 'ranking', { x: 8, y: 10, w: 4, h: 8 }, 'Ranking'),
    w('co-citas', 'proximas_citas', 'proximas_citas', 'lista', { x: 0, y: 18, w: 4, h: 14 }, 'Próximas citas'),
    w('co-mapa', 'flota_mapa', 'flota_mapa', 'mapa', { x: 4, y: 18, w: 8, h: 14 }, 'Flota'),
  ];
}

export type PlantillaId = 'operacion' | 'comercial';

export interface PlantillaDef {
  id: PlantillaId;
  nombre: string;
  widgets: () => DashboardWidget[];
}

export const PLANTILLAS: readonly PlantillaDef[] = [
  { id: 'operacion', nombre: 'Operación', widgets: widgetsPlantillaOperacion },
  { id: 'comercial', nombre: 'Comercial', widgets: widgetsPlantillaComercial },
];

export const PLANTILLA_DEFAULT: PlantillaId = 'operacion';

export function dashboardDesdePlantilla(
  plantillaId: PlantillaId,
  opts?: { id?: string; sistema?: boolean; nombre?: string },
): Dashboard {
  const def = PLANTILLAS.find((p) => p.id === plantillaId) ?? PLANTILLAS[0]!;
  const ahora = new Date().toISOString();
  return {
    id: opts?.id ?? `sys-${def.id}`,
    nombre: opts?.nombre ?? def.nombre,
    sistema: opts?.sistema ?? true,
    plantillaId: def.id,
    widgets: def.widgets(),
    actualizadoEn: ahora,
  };
}

export function dashboardsSistemaIniciales(): Dashboard[] {
  return [
    dashboardDesdePlantilla('operacion', { id: 'sys-operacion', sistema: true }),
    dashboardDesdePlantilla('comercial', { id: 'sys-comercial', sistema: true }),
  ];
}

export function plantillaIncluyeHeroOperacion(widgets: readonly DashboardWidget[]): boolean {
  const tieneCitas = widgets.some((x) => x.tipo === 'proximas_citas' || x.metricaId === 'proximas_citas');
  const tieneMapa = widgets.some((x) => x.tipo === 'flota_mapa' || x.metricaId === 'flota_mapa');
  const tieneKpisArriba = widgets.some(
    (x) => (x.tipo === 'kpis_generales' || x.metricaId === 'kpis_generales') && x.layout.y === 0,
  );
  return tieneCitas && tieneMapa && tieneKpisArriba;
}
