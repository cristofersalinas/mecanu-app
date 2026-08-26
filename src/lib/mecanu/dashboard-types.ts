/**
 * Modelo de dashboards personalizables del panel General.
 * Persistencia v1: localStorage. Forma estable para sync Supabase más adelante.
 * // TODO API: sincronizar dashboards por taller_id en Postgres.
 */

export type VizFormato =
  | 'numero'
  | 'numero_delta'
  | 'kpi_grupo'
  | 'lista'
  | 'mapa'
  | 'barras'
  | 'linea'
  | 'donut'
  | 'tiles'
  | 'ranking';

/** Tipos de widget / métrica del catálogo. */
export type WidgetTipo =
  | 'proximas_citas'
  | 'flota_mapa'
  | 'kpis_generales'
  | 'kpis_traslados'
  | 'kpis_tareas'
  | 'kpis_campanas'
  | 'servicios_barras'
  | 'indicadores_traslado'
  | 'ranking'
  | 'metrica';

export type DashboardCategoria =
  | 'operacion'
  | 'traslados'
  | 'campanas'
  | 'tareas'
  | 'flota'
  | 'dinero'
  | 'calidad'
  | 'agenda';

/** Layout en grid de 12 columnas. h en unidades de fila (~28px). */
export interface DashboardLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Opciones de visualización por widget (gráficos). */
export interface WidgetOpts {
  /** Relleno con degradado en barras/línea. */
  degradado?: boolean;
  /** Rango temporal de la serie. */
  rango?: '7d' | '1m';
}

export interface DashboardWidget {
  id: string;
  tipo: WidgetTipo;
  /** Id de métrica del catálogo (para tipo `metrica` o alias de widgets fijos). */
  metricaId: string;
  viz: VizFormato;
  layout: DashboardLayout;
  titulo?: string;
  opts?: WidgetOpts;
}

export interface Dashboard {
  id: string;
  nombre: string;
  /** Plantilla de sistema (no se puede borrar). */
  sistema: boolean;
  /** Id de plantilla origen (`operacion`, `comercial`, …). */
  plantillaId?: string;
  widgets: DashboardWidget[];
  actualizadoEn: string;
}

export interface DashboardStoreSnapshot {
  version: 1;
  tallerId: string;
  lastDashboardId: string;
  dashboards: Dashboard[];
}

export interface WidgetLimites {
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  /** Ancho/alto mínimo deseado (opcional, se aplica al clamp de resize). */
  minRatio?: number;
}

export const GRID_COLS = 12;
/** Altura de una fila del grid en px (aprox.). */
export const GRID_ROW_PX = 28;
export const GRID_GAP_PX = 16;
