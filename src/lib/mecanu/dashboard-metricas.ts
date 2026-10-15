/**
 * Resolvers de métricas del dashboard a partir de rutas / campañas / tareas / conductores.
 */
import {
  DISTANCIA_MEDIA_TRASLADO_KM,
  fmtHorasAhorradas,
  horasAhorradasClientes,
  kmRecorridosTraslados,
  kpisCampanas,
  kpisTareas,
  kpisTraslados,
  metricasGeneralesRutas,
  rutasPorEstado,
} from './kpis-panel';
import type { TareaKanban } from './pipeline-tareas';
import type { Campana, ColumnaTareaPipeline, RutaVista } from './types';

/** Subconjunto de campos que necesitan los resolvers (compatible con el panel). */
export type RutaMetrica = {
  id: string;
  estado: RutaVista['estado'] | string;
  fecha?: Date | null;
  conductorId?: string | null;
  clienteId?: string | null;
  seguro?: boolean | null;
  importe?: number | null;
  /** Lead sin cliente confirmado. */
  matriculaLead?: string | null;
};

export interface ConductorCalif {
  id: string;
  nombre: string;
  calificacion: number;
}

export interface DashboardDatosCtx {
  rutas: RutaMetrica[];
  campanas: Campana[];
  pipelineTareas: Record<ColumnaTareaPipeline, TareaKanban[]>;
  conductores: ConductorCalif[];
  ahora: Date;
  /** Rango para series (7d | 1m). */
  rangoSerie?: '7d' | '1m';
}

export interface MetricaNumero {
  kind: 'numero';
  value: string;
  label: string;
  delta?: string;
  dir?: 'up' | 'down';
  iva?: boolean;
}

export interface MetricaSeriePunto {
  label: string;
  valor: number;
}

export interface MetricaSerie {
  kind: 'serie';
  label: string;
  puntos: MetricaSeriePunto[];
  total: number;
}

export interface MetricaDonut {
  kind: 'donut';
  label: string;
  slices: { label: string; valor: number; color?: string }[];
}

export interface MetricaTiles {
  kind: 'tiles';
  items: { icon: string; label: string; valor: string }[];
}

export interface MetricaRankingItem {
  id: string;
  nombre: string;
  calif: string | null;
  valor: number;
}

export interface MetricaRanking {
  kind: 'ranking';
  items: MetricaRankingItem[];
}

export interface MetricaKpiGrupo {
  kind: 'kpi_grupo';
  items: MetricaNumero[];
}

export type MetricaResultado =
  | MetricaNumero
  | MetricaSerie
  | MetricaDonut
  | MetricaTiles
  | MetricaRanking
  | MetricaKpiGrupo;

const DIA_MS = 86400000;

function asRutasVista(rutas: RutaMetrica[]): RutaVista[] {
  return rutas as RutaVista[];
}

export function serieServicios(
  rutas: RutaMetrica[],
  ahora: Date,
  rango: '7d' | '1m' = '7d',
): MetricaSerie {
  return seriePorDia({
    label: 'Servicios de traslado',
    ahora,
    rango,
    valorEnVentana: (desde, hasta) =>
      rutas.filter((r) => r.fecha && r.fecha >= desde && r.fecha < hasta).length,
  });
}

function seriePorDia(opts: {
  label: string;
  ahora: Date;
  rango: '7d' | '1m';
  valorEnVentana: (desde: Date, hasta: Date) => number;
}): MetricaSerie {
  const dias = opts.rango === '7d' ? 7 : 30;
  const paso = opts.rango === '7d' ? 1 : 5;
  const puntos: MetricaSeriePunto[] = [];
  for (let i = dias - 1; i >= 0; i -= paso) {
    const desde = new Date(opts.ahora.getTime() - (i + paso - 1) * DIA_MS);
    const hasta = new Date(opts.ahora.getTime() - (i - 1) * DIA_MS);
    const valor = opts.valorEnVentana(desde, hasta);
    puntos.push({
      label: opts.rango === '7d'
        ? ['do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sá'][desde.getDay()]!
        : `${desde.getDate()}`,
      valor,
    });
  }
  return {
    kind: 'serie',
    label: opts.label,
    puntos,
    total: puntos.reduce((a, b) => a + b.valor, 0),
  };
}

/** Compara conteo de los últimos 7 días vs los 7 anteriores. */
export function crecimiento7d(
  fechas: (Date | null | undefined)[],
  ahora: Date,
): { delta?: string; dir?: 'up' | 'down' } {
  const t0 = ahora.getTime();
  const actual = fechas.filter((f) => f && f.getTime() >= t0 - 7 * DIA_MS && f.getTime() < t0).length;
  const prev = fechas.filter((f) => f && f.getTime() >= t0 - 14 * DIA_MS && f.getTime() < t0 - 7 * DIA_MS).length;
  const diff = actual - prev;
  if (diff === 0) return {};
  return { delta: String(Math.abs(diff)), dir: diff > 0 ? 'up' : 'down' };
}

function pct(parte: number, total: number): string {
  if (total <= 0) return '—';
  return `${((parte / total) * 100).toLocaleString('es-ES', { maximumFractionDigits: 0 })} %`;
}

function donutDesdeMap(label: string, map: Map<string, number>): MetricaDonut {
  return {
    kind: 'donut',
    label,
    slices: [...map.entries()]
      .map(([l, valor]) => ({ label: l, valor }))
      .filter((s) => s.valor > 0)
      .sort((a, b) => b.valor - a.valor),
  };
}

function serieComoBarras(donut: MetricaDonut): MetricaSerie {
  return {
    kind: 'serie',
    label: donut.label,
    puntos: donut.slices.map((s) => ({ label: s.label, valor: s.valor })),
    total: donut.slices.reduce((a, s) => a + s.valor, 0),
  };
}

/**
 * Resuelve según el formato de viz elegido en el repositorio.
 * Reglas: serie↔tiempo; reparto (donut) puede verse como barras categóricas.
 */
export function resolverParaViz(
  metricaId: string,
  viz: string,
  ctx: DashboardDatosCtx,
): MetricaResultado {
  if (viz === 'donut') {
    return resolverDonut(metricaId, ctx);
  }
  const r = resolverMetrica(metricaId, ctx);
  if ((viz === 'barras' || viz === 'linea') && r.kind === 'donut') {
    return serieComoBarras(r);
  }
  if ((viz === 'barras' || viz === 'linea') && r.kind === 'serie') {
    return r;
  }
  if ((viz === 'numero' || viz === 'numero_delta') && r.kind === 'numero') {
    if (viz === 'numero') return { ...r, delta: undefined, dir: undefined };
    return r;
  }
  return r;
}

export function resolverMetrica(metricaId: string, ctx: DashboardDatosCtx): MetricaResultado {
  const { rutas, campanas, pipelineTareas, conductores, ahora } = ctx;
  const rango = ctx.rangoSerie ?? '7d';
  const rutasVista = asRutasVista(rutas);
  const gen = metricasGeneralesRutas(rutasVista, ahora);
  const completados = rutasPorEstado(rutasVista, 'completado');
  const km = kmRecorridosTraslados(completados);
  const horas = horasAhorradasClientes(km);
  const kpisC = kpisCampanas(campanas);
  const porIdC = Object.fromEntries(kpisC.map((k) => [k.id, k]));

  switch (metricaId) {
    case 'kpis_generales': {
      const facturado = gen.facturado.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return {
        kind: 'kpi_grupo',
        items: [
          { kind: 'numero', label: 'Hoy', value: String(gen.trasladosHoy) },
          { kind: 'numero', label: 'En ruta', value: String(gen.enRuta) },
          { kind: 'numero', label: 'En taller', value: String(gen.enTaller) },
          { kind: 'numero', label: 'Prospectos', value: String(gen.prospectos) },
          { kind: 'numero', label: 'Facturado', value: `${facturado} €`, iva: true },
        ],
      };
    }
    case 'kpis_traslados':
      return {
        kind: 'kpi_grupo',
        items: kpisTraslados(rutasVista, ahora).map((k) => ({
          kind: 'numero' as const,
          label: k.label,
          value: k.value,
          delta: k.delta,
          dir: k.dir,
        })),
      };
    case 'kpis_tareas':
      return {
        kind: 'kpi_grupo',
        items: kpisTareas(pipelineTareas).map((k) => ({
          kind: 'numero' as const,
          label: k.label,
          value: k.value,
        })),
      };
    case 'kpis_campanas':
      return {
        kind: 'kpi_grupo',
        items: kpisC.map((k) => ({
          kind: 'numero' as const,
          label: k.label,
          value: k.value,
          iva: k.iva,
        })),
      };
    case 'servicios_barras':
    case 'serie_servicios':
      return serieServicios(rutas, ahora, rango);
    case 'serie_completados':
      return seriePorDia({
        label: 'Completados',
        ahora,
        rango,
        valorEnVentana: (desde, hasta) =>
          rutas.filter((r) =>
            r.estado === 'completado' && r.fecha && r.fecha >= desde && r.fecha < hasta
          ).length,
      });
    case 'serie_campanas':
      return seriePorDia({
        label: 'Campañas creadas',
        ahora,
        rango,
        valorEnVentana: (desde, hasta) =>
          campanas.filter((c) => c.fecha >= desde && c.fecha < hasta).length,
      });
    case 'serie_agendamientos':
      return seriePorDia({
        label: 'Agendamientos',
        ahora,
        rango,
        valorEnVentana: (desde, hasta) =>
          rutas.filter((r) =>
            r.fecha && r.fecha >= desde && r.fecha < hasta && r.estado !== 'prospectos' && r.estado !== 'cancelado'
          ).length,
      });
    case 'serie_facturado':
      return seriePorDia({
        label: 'Facturado',
        ahora,
        rango,
        valorEnVentana: (desde, hasta) =>
          rutas
            .filter((r) =>
              r.estado === 'completado' && r.fecha && r.fecha >= desde && r.fecha < hasta
            )
            .reduce((a, r) => a + (r.importe ?? 0), 0),
      });
    case 'origen_campanas': {
      const map = new Map<string, number>();
      for (const c of campanas) {
        const k = c.origenAutomatico ? 'Automática' : 'Manual';
        map.set(k, (map.get(k) ?? 0) + 1);
      }
      return donutDesdeMap('Origen de campañas', map);
    }
    case 'origen_agendamientos': {
      const conFecha = rutas.filter((r) => r.fecha && r.estado !== 'prospectos');
      const map = new Map<string, number>();
      for (const r of conFecha) {
        const k = r.matriculaLead?.trim() && !r.clienteId
          ? 'Lead'
          : r.clienteId
            ? 'Cliente'
            : 'Sin origen';
        map.set(k, (map.get(k) ?? 0) + 1);
      }
      return donutDesdeMap('Origen de agendamientos', map);
    }
    case 'estados_campana': {
      const map = new Map<string, number>();
      const labels: Record<string, string> = {
        nueva: 'Nueva',
        valorada: 'Valorada',
        enviada: 'Enviada',
        aceptada: 'Aceptada',
        rechazada: 'Rechazada',
        caducada: 'Caducada',
      };
      for (const c of campanas) {
        const k = labels[c.estado] ?? c.estado;
        map.set(k, (map.get(k) ?? 0) + 1);
      }
      return donutDesdeMap('Estado de campañas', map);
    }
    case 'tipos_campana': {
      const map = new Map<string, number>();
      for (const c of campanas) {
        const tipos = c.tipos.length ? c.tipos : ['Sin tipo'];
        for (const t of tipos) {
          map.set(t, (map.get(t) ?? 0) + 1);
        }
      }
      return donutDesdeMap('Tipos de campaña', map);
    }
    case 'traslados_hoy': {
      const k = kpisTraslados(rutasVista, ahora).find((x) => x.id === 'hoy');
      return {
        kind: 'numero',
        label: 'Traslados hoy',
        value: k?.value ?? '0',
        delta: k?.delta,
        dir: k?.dir,
      };
    }
    case 'traslados_agendados': {
      const n = rutasPorEstado(rutasVista, 'agendado');
      const crec = crecimiento7d(
        rutas.filter((r) => r.estado === 'agendado').map((r) => r.fecha),
        ahora,
      );
      return { kind: 'numero', label: 'Agendados', value: String(n), ...crec };
    }
    case 'traslados_en_ruta':
      return { kind: 'numero', label: 'En ruta', value: String(gen.enRuta) };
    case 'traslados_en_taller':
      return { kind: 'numero', label: 'En taller', value: String(gen.enTaller) };
    case 'traslados_completados': {
      const crec = crecimiento7d(
        rutas.filter((r) => r.estado === 'completado').map((r) => r.fecha),
        ahora,
      );
      return { kind: 'numero', label: 'Completados', value: String(completados), ...crec };
    }
    case 'traslados_cancelados':
      return { kind: 'numero', label: 'Cancelados', value: String(rutasPorEstado(rutasVista, 'cancelado')) };
    case 'traslados_prospectos':
      return { kind: 'numero', label: 'Prospectos', value: String(gen.prospectos) };
    case 'km_recorridos':
      return {
        kind: 'numero',
        label: 'Kilómetros recorridos',
        value: `${km.toLocaleString('es-ES', { maximumFractionDigits: 0 })} km`,
      };
    case 'distancia_media':
      return {
        kind: 'numero',
        label: 'Distancia media',
        value: `${DISTANCIA_MEDIA_TRASLADO_KM.toLocaleString('es-ES', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })} km`,
      };
    case 'horas_ahorradas':
      return { kind: 'numero', label: 'Horas ahorradas', value: fmtHorasAhorradas(horas) };
    case 'pct_seguro': {
      const con = rutas.filter((r) => r.seguro).length;
      return { kind: 'numero', label: '% con seguro', value: pct(con, rutas.length) };
    }
    case 'pct_conductor': {
      const con = rutas.filter((r) => r.conductorId).length;
      return { kind: 'numero', label: '% con conductor', value: pct(con, rutas.length) };
    }
    case 'campanas_pendientes':
      return { kind: 'numero', label: 'Pendientes', value: porIdC['pendientes']?.value ?? '0' };
    case 'campanas_enviadas':
      return { kind: 'numero', label: 'Enviadas', value: porIdC['enviadas']?.value ?? '0' };
    case 'campanas_aceptadas': {
      const n = campanas.filter((c) => c.estado === 'aceptada').length;
      const crec = crecimiento7d(
        campanas.filter((c) => c.estado === 'aceptada').map((c) => c.fecha),
        ahora,
      );
      return { kind: 'numero', label: 'Aceptadas', value: String(n), ...crec };
    }
    case 'monto_activo':
      return {
        kind: 'numero',
        label: 'Monto activo',
        value: porIdC['monto-activo']?.value ?? '0',
        iva: true,
      };
    case 'monto_aceptado':
      return {
        kind: 'numero',
        label: 'Monto aceptado',
        value: porIdC['monto-aceptado']?.value ?? '0',
        iva: true,
      };
    case 'tasa_aceptacion': {
      const aceptadas = campanas.filter((c) => c.estado === 'aceptada').length;
      const enviadasOMas = campanas.filter((c) =>
        c.estado === 'enviada' || c.estado === 'aceptada' || c.estado === 'rechazada' || c.estado === 'caducada'
      ).length;
      return { kind: 'numero', label: 'Tasa de aceptación', value: pct(aceptadas, enviadasOMas) };
    }
    case 'tareas_pendientes':
      return { kind: 'numero', label: 'Pendientes', value: String(pipelineTareas.pendiente.length) };
    case 'tareas_urgentes':
      return {
        kind: 'numero',
        label: 'Urgentes',
        value: String(pipelineTareas.pendiente.filter((t) => t.deber.urgencia === 'ahora').length),
      };
    case 'tareas_hechas':
      return { kind: 'numero', label: 'Hechas', value: String(pipelineTareas.hecho.length) };
    case 'calificacion_media': {
      if (conductores.length === 0) return { kind: 'numero', label: 'Calificación media', value: '—' };
      const media = conductores.reduce((a, c) => a + c.calificacion, 0) / conductores.length;
      return {
        kind: 'numero',
        label: 'Calificación media',
        value: media.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      };
    }
    case 'flota_en_ruta':
      return { kind: 'numero', label: 'Flota en ruta', value: String(gen.enRuta) };
    case 'flota_en_taller':
      return { kind: 'numero', label: 'Flota en taller', value: String(gen.enTaller) };
    case 'facturado': {
      const v = gen.facturado.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return { kind: 'numero', label: 'Facturado', value: `${v} €`, iva: true };
    }
    case 'indicadores_traslado': {
      const calif = conductores.length
        ? (conductores.reduce((a, c) => a + c.calificacion, 0) / conductores.length)
          .toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        : '—';
      return {
        kind: 'tiles',
        items: [
          {
            icon: 'route',
            label: 'Distancia promedio',
            valor: `${DISTANCIA_MEDIA_TRASLADO_KM.toLocaleString('es-ES', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })} km`,
          },
          {
            icon: 'alt_route',
            label: 'Kilómetros recorridos',
            valor: `${km.toLocaleString('es-ES', { maximumFractionDigits: 0 })} km`,
          },
          { icon: 'schedule', label: 'Horas ahorradas a clientes', valor: fmtHorasAhorradas(horas) },
          { icon: 'star', label: 'Calificación promedio', valor: calif },
        ],
      };
    }
    case 'ranking': {
      const items = conductores
        .map((c) => ({
          id: c.id,
          nombre: c.nombre,
          calif: c.calificacion.toLocaleString('es-ES', { minimumFractionDigits: 1 }),
          valor: rutas.filter((r) => r.conductorId === c.id).length,
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);
      return { kind: 'ranking', items };
    }
    case 'estados_donut': {
      const estados: { id: RutaVista['estado']; label: string }[] = [
        { id: 'prospectos', label: 'Prospectos' },
        { id: 'agendado', label: 'Agendado' },
        { id: 'en_ruta', label: 'En ruta' },
        { id: 'en_taller', label: 'En taller' },
        { id: 'completado', label: 'Completado' },
        { id: 'cancelado', label: 'Cancelado' },
      ];
      return {
        kind: 'donut',
        label: 'Reparto por estado',
        slices: estados
          .map((e) => ({ label: e.label, valor: rutasPorEstado(rutasVista, e.id) }))
          .filter((s) => s.valor > 0),
      };
    }
    default:
      return { kind: 'numero', label: metricaId, value: '—' };
  }
}

/** Donut a partir de métrica pct / tasa / reparto cuando el viz lo pide. */
export function resolverDonut(metricaId: string, ctx: DashboardDatosCtx): MetricaDonut {
  const { rutas, campanas } = ctx;
  if (metricaId === 'pct_seguro') {
    const con = rutas.filter((r) => r.seguro).length;
    return {
      kind: 'donut',
      label: '% con seguro',
      slices: [
        { label: 'Con seguro', valor: con },
        { label: 'Sin', valor: Math.max(0, rutas.length - con) },
      ],
    };
  }
  if (metricaId === 'pct_conductor') {
    const con = rutas.filter((r) => r.conductorId).length;
    return {
      kind: 'donut',
      label: '% con conductor',
      slices: [
        { label: 'Asignado', valor: con },
        { label: 'Sin', valor: Math.max(0, rutas.length - con) },
      ],
    };
  }
  if (metricaId === 'tasa_aceptacion') {
    const aceptadas = campanas.filter((c) => c.estado === 'aceptada').length;
    const resto = campanas.filter((c) =>
      c.estado === 'enviada' || c.estado === 'rechazada' || c.estado === 'caducada'
    ).length;
    return {
      kind: 'donut',
      label: 'Aceptación',
      slices: [
        { label: 'Aceptadas', valor: aceptadas },
        { label: 'Otras', valor: resto },
      ],
    };
  }
  const r = resolverMetrica(metricaId, ctx);
  if (r.kind === 'donut') return r;
  return { kind: 'donut', label: 'Sin datos', slices: [] };
}

export function rankingClientes(
  rutas: RutaMetrica[],
  nombreCliente: (id: string) => string,
): MetricaRankingItem[] {
  const porCliente = new Map<string, number>();
  rutas.forEach((r) => {
    if (!r.clienteId) return;
    porCliente.set(r.clienteId, (porCliente.get(r.clienteId) ?? 0) + 1);
  });
  return [...porCliente.entries()]
    .map(([id, valor]) => ({ id, nombre: nombreCliente(id), calif: null, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
}
