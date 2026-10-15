/**
 * Repositorio de reports del dashboard General.
 * Cada entrada es atómica (métrica, serie o reparto). Los «bloques» KPI
 * existen solo como atajo de plantilla; no obligan a usarse juntos.
 */
import type {
  DashboardCategoria,
  VizFormato,
  WidgetLimites,
  WidgetTipo,
} from './dashboard-types';

/** Cómo se presenta en el panel «Añadir report». */
export type FamiliaReport =
  | 'metrica'
  | 'serie'
  | 'reparto'
  | 'bloque'
  | 'lista'
  | 'mapa';

export type EjeXReport = 'tiempo' | 'origen' | 'estado' | 'categoria';
export type EjeYReport = 'conteo' | 'importe' | 'porcentaje' | 'valor';

export interface CatalogoEntrada {
  id: string;
  label: string;
  categoria: DashboardCategoria;
  tipo: WidgetTipo;
  familia: FamiliaReport;
  vizPermitidas: readonly VizFormato[];
  vizDefault: VizFormato;
  limites: WidgetLimites;
  /** Eje X del gráfico (series / repartos). */
  ejeX?: EjeXReport;
  /** Eje Y / medida. */
  ejeY?: EjeYReport;
  /** Barras/línea admiten degradado opcional. */
  degradadoOpcional?: boolean;
  /** Si true, no aparece en «Añadir» (solo plantillas). */
  ocultoEnCatalogo?: boolean;
  descripcion?: string;
}

const LIMITE_KPI: WidgetLimites = { minW: 2, maxW: 4, minH: 3, maxH: 5 };
const LIMITE_KPI_GRUPO: WidgetLimites = { minW: 4, maxW: 12, minH: 5, maxH: 14 };
const LIMITE_GRAFICO: WidgetLimites = { minW: 4, maxW: 12, minH: 5, maxH: 12 };
const LIMITE_LISTA: WidgetLimites = { minW: 3, maxW: 8, minH: 5, maxH: 18 };
const LIMITE_TILES: WidgetLimites = { minW: 4, maxW: 8, minH: 5, maxH: 14 };
const LIMITE_RANKING: WidgetLimites = { minW: 4, maxW: 8, minH: 5, maxH: 14 };
const LIMITE_DONUT: WidgetLimites = { minW: 4, maxW: 8, minH: 6, maxH: 12 };

function metrica(
  id: string,
  label: string,
  categoria: DashboardCategoria,
  extra?: Partial<CatalogoEntrada>,
): CatalogoEntrada {
  return {
    id,
    label,
    categoria,
    tipo: 'metrica',
    familia: 'metrica',
    vizPermitidas: ['numero', 'numero_delta'],
    vizDefault: 'numero_delta',
    limites: LIMITE_KPI,
    ejeY: 'conteo',
    ...extra,
  };
}

function serie(
  id: string,
  label: string,
  categoria: DashboardCategoria,
  extra?: Partial<CatalogoEntrada>,
): CatalogoEntrada {
  return {
    id,
    label,
    categoria,
    tipo: 'metrica',
    familia: 'serie',
    vizPermitidas: ['barras', 'linea'],
    vizDefault: 'barras',
    limites: LIMITE_GRAFICO,
    ejeX: 'tiempo',
    ejeY: 'conteo',
    degradadoOpcional: true,
    ...extra,
  };
}

function reparto(
  id: string,
  label: string,
  categoria: DashboardCategoria,
  ejeX: EjeXReport,
  extra?: Partial<CatalogoEntrada>,
): CatalogoEntrada {
  return {
    id,
    label,
    categoria,
    tipo: 'metrica',
    familia: 'reparto',
    vizPermitidas: ['donut', 'barras'],
    vizDefault: 'donut',
    limites: LIMITE_DONUT,
    ejeX,
    ejeY: 'conteo',
    degradadoOpcional: true,
    ...extra,
  };
}

export const CATALOGO_DASHBOARD: readonly CatalogoEntrada[] = [
  // ——— Listas / mapa (operativos) ———
  {
    id: 'proximas_citas',
    label: 'Próximas citas',
    categoria: 'agenda',
    tipo: 'proximas_citas',
    familia: 'lista',
    vizPermitidas: ['lista'],
    vizDefault: 'lista',
    limites: { minW: 3, maxW: 6, minH: 8, maxH: 22 },
    descripcion: 'Lista interactiva de traslados próximos',
  },
  {
    id: 'flota_mapa',
    label: 'Mapa de flota',
    categoria: 'flota',
    tipo: 'flota_mapa',
    familia: 'mapa',
    vizPermitidas: ['mapa'],
    vizDefault: 'mapa',
    limites: { minW: 6, maxW: 12, minH: 10, maxH: 24, minRatio: 1.4 },
    descripcion: 'Mapa alrededor del taller (mín. ~3:2)',
  },
  {
    id: 'ranking',
    label: 'Ranking',
    categoria: 'calidad',
    tipo: 'ranking',
    familia: 'lista',
    vizPermitidas: ['ranking'],
    vizDefault: 'ranking',
    limites: LIMITE_RANKING,
  },

  // ——— Métricas unitarias ———
  metrica('traslados_hoy', 'Traslados hoy', 'traslados', {
    descripcion: 'Con ventana comprometida hoy · vs ayer',
  }),
  metrica('traslados_agendados', 'Agendados', 'traslados'),
  metrica('traslados_en_ruta', 'En ruta', 'traslados'),
  metrica('traslados_en_taller', 'En taller', 'traslados'),
  metrica('traslados_completados', 'Completados', 'traslados'),
  metrica('traslados_cancelados', 'Cancelados', 'traslados'),
  metrica('traslados_prospectos', 'Prospectos', 'traslados'),
  metrica('flota_en_ruta', 'Flota en ruta', 'flota'),
  metrica('flota_en_taller', 'Flota en taller', 'flota'),
  metrica('km_recorridos', 'Kilómetros recorridos', 'operacion', { ejeY: 'valor' }),
  metrica('distancia_media', 'Distancia media', 'operacion', { ejeY: 'valor', vizPermitidas: ['numero'], vizDefault: 'numero' }),
  metrica('horas_ahorradas', 'Horas ahorradas a clientes', 'operacion', { ejeY: 'valor' }),
  metrica('pct_seguro', '% con seguro', 'operacion', {
    ejeY: 'porcentaje',
    vizPermitidas: ['numero', 'numero_delta', 'donut'],
    limites: { ...LIMITE_KPI, maxW: 6, maxH: 8 },
  }),
  metrica('pct_conductor', '% con conductor', 'operacion', {
    ejeY: 'porcentaje',
    vizPermitidas: ['numero', 'numero_delta', 'donut'],
    limites: { ...LIMITE_KPI, maxW: 6, maxH: 8 },
  }),
  metrica('campanas_pendientes', 'Campañas pendientes', 'campanas'),
  metrica('campanas_enviadas', 'Campañas enviadas', 'campanas'),
  metrica('campanas_aceptadas', 'Campañas aceptadas', 'campanas'),
  metrica('tasa_aceptacion', 'Tasa de aceptación', 'campanas', {
    ejeY: 'porcentaje',
    vizPermitidas: ['numero', 'numero_delta', 'donut'],
    limites: { ...LIMITE_KPI, maxW: 6, maxH: 8 },
  }),
  metrica('monto_activo', 'Monto activo', 'dinero', { ejeY: 'importe', vizPermitidas: ['numero'], vizDefault: 'numero' }),
  metrica('monto_aceptado', 'Monto aceptado', 'dinero', { ejeY: 'importe', vizPermitidas: ['numero'], vizDefault: 'numero' }),
  metrica('facturado', 'Facturado (completados)', 'dinero', { ejeY: 'importe', vizPermitidas: ['numero'], vizDefault: 'numero' }),
  metrica('tareas_pendientes', 'Tareas pendientes', 'tareas'),
  metrica('tareas_urgentes', 'Tareas urgentes', 'tareas'),
  metrica('tareas_hechas', 'Tareas hechas', 'tareas'),
  metrica('calificacion_media', 'Calificación media', 'calidad', {
    ejeY: 'valor',
    vizPermitidas: ['numero'],
    vizDefault: 'numero',
  }),

  // ——— Series temporales (Y = medida, X = tiempo) ———
  serie('serie_servicios', 'Traslados en el tiempo', 'traslados', {
    descripcion: 'Conteo de traslados por día · 7d / 1m',
  }),
  serie('serie_completados', 'Completados en el tiempo', 'traslados'),
  serie('serie_campanas', 'Campañas creadas en el tiempo', 'campanas', {
    descripcion: 'Altas de campaña por día',
  }),
  serie('serie_agendamientos', 'Agendamientos en el tiempo', 'agenda', {
    descripcion: 'Rutas con ventana comprometida por día',
  }),
  serie('serie_facturado', 'Facturado en el tiempo', 'dinero', {
    ejeY: 'importe',
    descripcion: 'Suma de importes de completados por día',
  }),
  // Alias plantilla
  {
    id: 'servicios_barras',
    label: 'Servicios de traslado',
    categoria: 'traslados',
    tipo: 'servicios_barras',
    familia: 'serie',
    vizPermitidas: ['barras', 'linea'],
    vizDefault: 'barras',
    limites: LIMITE_GRAFICO,
    ejeX: 'tiempo',
    ejeY: 'conteo',
    degradadoOpcional: true,
    ocultoEnCatalogo: true,
  },

  // ——— Repartos (torta / barras por categoría) ———
  reparto('origen_campanas', 'Origen de creación de campañas', 'campanas', 'origen', {
    descripcion: 'Automática (inspección/check-in) vs manual',
  }),
  reparto('origen_agendamientos', 'Origen de creación de agendamientos', 'agenda', 'origen', {
    descripcion: 'Lead sin cliente vs cliente vinculado',
  }),
  reparto('estados_donut', 'Reparto por estado de ruta', 'traslados', 'estado'),
  reparto('estados_campana', 'Reparto por estado de campaña', 'campanas', 'estado'),
  reparto('tipos_campana', 'Campañas por tipo de hallazgo', 'campanas', 'categoria', {
    descripcion: 'Agrupa por tipos[] de la campaña',
  }),

  // ——— Bloques (atajos de plantilla; opcionales) ———
  {
    id: 'kpis_generales',
    label: 'Pack KPIs generales',
    categoria: 'operacion',
    tipo: 'kpis_generales',
    familia: 'bloque',
    vizPermitidas: ['kpi_grupo'],
    vizDefault: 'kpi_grupo',
    limites: { ...LIMITE_KPI_GRUPO, minW: 8, maxW: 12 },
    descripcion: 'Atajo: hoy / en ruta / taller / prospectos / facturado',
  },
  {
    id: 'kpis_traslados',
    label: 'Pack KPIs traslados',
    categoria: 'traslados',
    tipo: 'kpis_traslados',
    familia: 'bloque',
    vizPermitidas: ['kpi_grupo'],
    vizDefault: 'kpi_grupo',
    limites: LIMITE_KPI_GRUPO,
  },
  {
    id: 'kpis_tareas',
    label: 'Pack KPIs tareas',
    categoria: 'tareas',
    tipo: 'kpis_tareas',
    familia: 'bloque',
    vizPermitidas: ['kpi_grupo'],
    vizDefault: 'kpi_grupo',
    limites: LIMITE_KPI_GRUPO,
  },
  {
    id: 'kpis_campanas',
    label: 'Pack KPIs campañas',
    categoria: 'campanas',
    tipo: 'kpis_campanas',
    familia: 'bloque',
    vizPermitidas: ['kpi_grupo'],
    vizDefault: 'kpi_grupo',
    limites: LIMITE_KPI_GRUPO,
  },
  {
    id: 'indicadores_traslado',
    label: 'Pack indicadores de traslado',
    categoria: 'operacion',
    tipo: 'indicadores_traslado',
    familia: 'bloque',
    vizPermitidas: ['tiles'],
    vizDefault: 'tiles',
    limites: LIMITE_TILES,
  },
] as const;

const POR_ID = new Map(CATALOGO_DASHBOARD.map((e) => [e.id, e]));

export function entradaCatalogo(id: string): CatalogoEntrada | undefined {
  return POR_ID.get(id);
}

export function limitesDeWidget(metricaId: string, tipo?: WidgetTipo): WidgetLimites {
  const e = entradaCatalogo(metricaId);
  if (e) return e.limites;
  if (tipo === 'flota_mapa') return { minW: 6, maxW: 12, minH: 10, maxH: 24, minRatio: 1.4 };
  if (tipo === 'proximas_citas') return { minW: 3, maxW: 6, minH: 8, maxH: 22 };
  return { minW: 2, maxW: 12, minH: 2, maxH: 16 };
}

export const CATEGORIA_LABEL: Record<DashboardCategoria, string> = {
  operacion: 'Operación',
  traslados: 'Traslados',
  campanas: 'Campañas',
  tareas: 'Tareas',
  flota: 'Flota',
  dinero: 'Dinero',
  calidad: 'Calidad',
  agenda: 'Agenda',
};

export const FAMILIA_LABEL: Record<FamiliaReport, string> = {
  metrica: 'Métricas',
  serie: 'Series',
  reparto: 'Repartos',
  bloque: 'Packs',
  lista: 'Listas',
  mapa: 'Mapas',
};

export const EJE_X_LABEL: Record<EjeXReport, string> = {
  tiempo: 'Tiempo',
  origen: 'Origen',
  estado: 'Estado',
  categoria: 'Categoría',
};

export const EJE_Y_LABEL: Record<EjeYReport, string> = {
  conteo: 'Conteo',
  importe: 'Importe',
  porcentaje: '%',
  valor: 'Valor',
};

export const VIZ_LABEL: Record<VizFormato, string> = {
  numero: 'Número',
  numero_delta: 'Número + crecimiento',
  kpi_grupo: 'Grupo de KPIs',
  lista: 'Lista',
  mapa: 'Mapa',
  barras: 'Barras',
  linea: 'Línea',
  donut: 'Torta',
  tiles: 'Tiles',
  ranking: 'Ranking',
};
