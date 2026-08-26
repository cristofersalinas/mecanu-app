'use client';

import { useEffect, useMemo, useState } from 'react';
import { ErrorState } from '@/components/ds/ErrorState';
import type { CatalogoEntrada } from '@/lib/mecanu/dashboard-catalogo';
import { entradaCatalogo } from '@/lib/mecanu/dashboard-catalogo';
import { clampLayout, primerHuecoLibre } from '@/lib/mecanu/dashboard-layout';
import {
  rankingClientes,
  resolverMetrica,
  resolverParaViz,
  type DashboardDatosCtx,
} from '@/lib/mecanu/dashboard-metricas';
import { dashboardDesdePlantilla } from '@/lib/mecanu/dashboard-plantillas';
import {
  cargarDashboards,
  duplicarDashboard,
  eliminarDashboard,
  guardarDashboards,
  marcarUltimoDashboard,
  resetDashboardAPlantilla,
  TALLER_ID_DEFAULT,
  upsertDashboard,
} from '@/lib/mecanu/dashboard-store';
import type { Dashboard, DashboardWidget, VizFormato, WidgetOpts } from '@/lib/mecanu/dashboard-types';
import {
  construirVistaFlota, esEstadoFlotaMapa, proximasCitas, type MarcadorFlota, type RutaFlotaInput,
} from '@/lib/mecanu/flota-panel';
import { usePanel } from '../store';
import {
  CONDUCTORES, TALLER, cliente, conductor, fmtDinero, vehiculo,
  etiquetaVehiculo,
} from '../data';
import { CardsSkeleton, Eyebrow } from '../ui/Primitives';
import { ImporteIva } from '../ui/ImporteIva';
import { useCarga, useAhora } from '../ui/useCarga';
import { supabasePanelActivo, FETCH_SNAPSHOT } from '../hidratar-panel';
import {
  guardarIconoConductorFlota,
  ICONO_CONDUCTOR_DEFAULT,
  leerIconoConductorFlota,
  type IconoConductorFlota,
} from './flota-icono-conductor';
import { DashboardGrid } from './DashboardGrid';
import { DashboardToolbar } from './DashboardToolbar';
import { AddWidgetPanel } from './catalogo/AddWidgetPanel';
import { WidgetBarras } from './widgets/WidgetBarras';
import { WidgetDonut } from './widgets/WidgetDonut';
import { WidgetFlotaMapa } from './widgets/WidgetFlotaMapa';
import { WidgetKpiGrupo } from './widgets/WidgetKpiGrupo';
import { WidgetKpiNumero } from './widgets/WidgetKpiNumero';
import { WidgetLinea } from './widgets/WidgetLinea';
import { WidgetProximasCitas } from './widgets/WidgetProximasCitas';
import { WidgetRanking } from './widgets/WidgetRanking';
import { WidgetTiles } from './widgets/WidgetTiles';
import styles from '../panel.module.css';

function rutasFlotaDesdePanel(
  rutas: ReturnType<typeof usePanel>['rutas'],
): RutaFlotaInput[] {
  return rutas.filter((r) => esEstadoFlotaMapa(r.estado)).map((r) => {
    const v = vehiculo(r.vehiculoId);
    const c = r.conductorId ? conductor(r.conductorId) : null;
    const vehiculoLabel = v
      ? `${v.matricula} · ${etiquetaVehiculo(v)}`
      : (r.matriculaLead ? `${r.matriculaLead} · ${r.id}` : r.id);
    const direccionCard = r.estado === 'en_taller'
      ? TALLER.direccion
      : (r.direccionOrigen ?? r.direccion ?? TALLER.direccion);
    return {
      id: r.id,
      estado: r.estado,
      conductorId: r.conductorId,
      vehiculoLabel,
      conductorNombre: c?.nombre ?? null,
      direccionCard,
      marca: v?.marca ?? null,
      modelo: v?.modelo ?? null,
    };
  });
}

function fmtValorMetrica(value: string, iva?: boolean) {
  if (!iva) return value;
  const n = Number(value);
  if (Number.isFinite(n)) return <ImporteIva texto={fmtDinero(n, true)} />;
  return <ImporteIva texto={value} />;
}

export function GeneralDashboard() {
  const { rutas, campanas, seleccionar, irA, pipelineTareas, cargandoDatos } = usePanel();
  const cargandoMock = useCarga();
  const cargando = supabasePanelActivo() ? cargandoDatos : cargandoMock;
  const ahora = useAhora();

  const [rango, setRango] = useState<'7d' | '1m'>('7d');
  const [rank, setRank] = useState<'conductor' | 'cliente'>('conductor');
  const [marcadores, setMarcadores] = useState<MarcadorFlota[]>([]);
  const [iconoConductor, setIconoConductor] = useState<IconoConductorFlota>(ICONO_CONDUCTOR_DEFAULT);

  const [snapshot, setSnapshot] = useState(() =>
    cargarDashboards(TALLER_ID_DEFAULT, typeof window !== 'undefined' ? window.localStorage : null),
  );
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Dashboard | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIconoConductor(leerIconoConductorFlota());
    const loaded = cargarDashboards(TALLER_ID_DEFAULT, window.localStorage);
    setSnapshot(loaded);
    setHydrated(true);
  }, []);

  const activeId = editing && draft ? draft.id : snapshot.lastDashboardId;
  const activeDashboard = editing && draft
    ? draft
    : (snapshot.dashboards.find((d) => d.id === activeId) ?? snapshot.dashboards[0]!);
  const widgets = activeDashboard.widgets;
  const dirty = editing && draft
    ? JSON.stringify(draft.widgets) !== JSON.stringify(
      snapshot.dashboards.find((d) => d.id === draft.id)?.widgets,
    ) || draft.nombre !== snapshot.dashboards.find((d) => d.id === draft.id)?.nombre
    : false;

  const citas = useMemo(
    () => proximasCitas(rutas, new Date(ahora)),
    [rutas, ahora],
  );

  const vistaLocal = useMemo(
    () => construirVistaFlota({
      tallerDireccion: TALLER.direccion,
      tallerNombre: TALLER.nombre,
      rutas: rutasFlotaDesdePanel(rutas),
      conductores: CONDUCTORES.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        proceso: c.proceso,
      })),
      ahora: new Date(ahora),
    }),
    [ahora, rutas],
  );

  useEffect(() => {
    if (!supabasePanelActivo()) {
      setMarcadores(vistaLocal.marcadores);
      return;
    }
    let cancelado = false;
    const cargar = async () => {
      try {
        const res = await fetch('/api/v1/panel/flota', FETCH_SNAPSHOT);
        if (!res.ok) throw new Error(String(res.status));
        const raw = await res.json() as {
          marcadores?: (Omit<MarcadorFlota, 'actualizadaEn'> & { actualizadaEn: string | null })[];
        };
        if (cancelado) return;
        setMarcadores((raw.marcadores ?? []).map((m) => ({
          ...m,
          actualizadaEn: m.actualizadaEn ? new Date(m.actualizadaEn) : null,
        })));
      } catch {
        if (!cancelado) setMarcadores(vistaLocal.marcadores);
      }
    };
    void cargar();
    const t = setInterval(cargar, 30_000);
    return () => {
      cancelado = true;
      clearInterval(t);
    };
  }, [vistaLocal]);

  const ctx: DashboardDatosCtx = useMemo(() => ({
    rutas,
    campanas,
    pipelineTareas,
    conductores: CONDUCTORES.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      calificacion: c.calificacion,
    })),
    ahora: new Date(ahora),
    rangoSerie: rango,
  }), [rutas, campanas, pipelineTareas, ahora, rango]);

  const rankingItems = useMemo(() => {
    if (rank === 'conductor') {
      const r = resolverMetrica('ranking', ctx);
      return r.kind === 'ranking' ? r.items : [];
    }
    return rankingClientes(rutas, (id) => cliente(id)?.nombre ?? '—');
  }, [rank, ctx, rutas]);

  const persist = (next: typeof snapshot) => {
    setSnapshot(next);
    guardarDashboards(next, typeof window !== 'undefined' ? window.localStorage : null);
  };

  const setWidgets = (next: DashboardWidget[]) => {
    if (!draft) return;
    setDraft({ ...draft, widgets: next });
  };

  const onAddWidget = (entrada: CatalogoEntrada, viz: VizFormato, opts?: WidgetOpts) => {
    if (!draft) return;
    const lim = entrada.limites;
    const size = {
      w: Math.min(lim.maxW, Math.max(lim.minW, lim.minW === lim.maxW ? lim.minW : Math.round((lim.minW + lim.maxW) / 2))),
      h: Math.min(lim.maxH, Math.max(lim.minH, lim.minH + 1)),
    };
    const layout = clampLayout(primerHuecoLibre(draft.widgets, size), lim);
    const id = `w-${Date.now().toString(36)}`;
    const widget: DashboardWidget = {
      id,
      tipo: entrada.tipo,
      metricaId: entrada.id,
      viz,
      layout,
      titulo: entrada.label,
      opts,
    };
    setDraft({ ...draft, widgets: [...draft.widgets, widget] });
  };

  const renderWidget = (w: DashboardWidget) => {
    const remove = editing ? () => setWidgets(widgets.filter((x) => x.id !== w.id)) : undefined;
    const titulo = w.titulo ?? entradaCatalogo(w.metricaId)?.label;
    const ctxW: DashboardDatosCtx = {
      ...ctx,
      rangoSerie: w.opts?.rango ?? ctx.rangoSerie,
    };

    if (w.tipo === 'proximas_citas' || w.metricaId === 'proximas_citas') {
      return (
        <WidgetProximasCitas
          citas={citas}
          editing={editing}
          onRemove={remove}
          titulo={titulo}
          onAbrirRuta={(id) => seleccionar({ kind: 'ruta', id }, 'ficha')}
          onIrTraslados={() => irA('tablero', 'traslados')}
        />
      );
    }

    if (w.tipo === 'flota_mapa' || w.metricaId === 'flota_mapa') {
      return (
        <WidgetFlotaMapa
          marcadores={marcadores}
          tallerFallback={vistaLocal.taller}
          iconoConductor={iconoConductor}
          onIconoConductorChange={(id) => {
            setIconoConductor(id);
            guardarIconoConductorFlota(id);
          }}
          onAbrirRuta={(rutaId) => seleccionar({ kind: 'ruta', id: rutaId }, 'ficha')}
          editing={editing}
          onRemove={remove}
          titulo={titulo}
        />
      );
    }

    if (w.tipo === 'ranking' || w.metricaId === 'ranking' || w.viz === 'ranking') {
      return (
        <WidgetRanking
          titulo={titulo}
          items={rankingItems}
          modo={rank}
          onModo={setRank}
          editing={editing}
          onRemove={remove}
        />
      );
    }

    if (
      w.viz === 'kpi_grupo'
      || w.tipo === 'kpis_generales'
      || w.tipo === 'kpis_traslados'
      || w.tipo === 'kpis_tareas'
      || w.tipo === 'kpis_campanas'
    ) {
      const grupo = resolverMetrica(w.metricaId, ctxW);
      if (grupo.kind !== 'kpi_grupo') return null;
      const link = w.metricaId === 'kpis_traslados'
        ? { label: 'Ir a traslados', go: () => irA('tablero', 'traslados') }
        : w.metricaId === 'kpis_tareas'
          ? { label: 'Abrir tablero', go: () => irA('tablero', 'tareas') }
          : w.metricaId === 'kpis_campanas'
            ? { label: 'Ir a campañas', go: () => irA('tablero', 'campanas') }
            : null;
      return (
        <WidgetKpiGrupo
          titulo={titulo ?? 'KPIs'}
          gridW={w.layout.w}
          items={grupo.items.map((k, i) => ({
            id: `${w.id}-${i}`,
            label: k.label,
            value: fmtValorMetrica(k.value, k.iva),
            delta: k.delta,
            dir: k.dir,
          }))}
          linkLabel={link?.label}
          onLink={link?.go}
          editing={editing}
          onRemove={remove}
        />
      );
    }

    if (w.tipo === 'indicadores_traslado' || w.viz === 'tiles' || w.metricaId === 'indicadores_traslado') {
      const tiles = resolverMetrica('indicadores_traslado', ctxW);
      if (tiles.kind !== 'tiles') return null;
      return (
        <WidgetTiles
          titulo={titulo}
          items={tiles.items}
          gridW={w.layout.w}
          editing={editing}
          onRemove={remove}
        />
      );
    }

    // Reports del repositorio: número / serie / torta según viz + metricaId
    const data = resolverParaViz(w.metricaId, w.viz, ctxW);

    if (w.viz === 'barras' || w.viz === 'linea') {
      if (data.kind !== 'serie') {
        return (
          <div className={styles.panelBox} style={{ padding: 16, height: '100%' }}>
            <ErrorState variant="empty" compact message="Este report no admite gráfico de serie." />
          </div>
        );
      }
      const esTiempo = entradaCatalogo(w.metricaId)?.ejeX === 'tiempo';
      if (w.viz === 'linea') {
        return (
          <WidgetLinea
            titulo={titulo}
            puntos={data.puntos}
            total={data.total}
            degradado={Boolean(w.opts?.degradado)}
            editing={editing}
            onRemove={remove}
          />
        );
      }
      return (
        <WidgetBarras
          titulo={titulo}
          puntos={data.puntos}
          total={data.total}
          rango={esTiempo ? (w.opts?.rango ?? rango) : undefined}
          onRango={esTiempo ? (r) => {
            if (editing) {
              setWidgets(widgets.map((x) =>
                x.id === w.id ? { ...x, opts: { ...x.opts, rango: r } } : x,
              ));
            } else {
              setRango(r);
            }
          } : undefined}
          degradado={Boolean(w.opts?.degradado)}
          editing={editing}
          onRemove={remove}
        />
      );
    }

    if (w.viz === 'donut') {
      if (data.kind !== 'donut') {
        return (
          <div className={styles.panelBox} style={{ padding: 16, height: '100%' }}>
            <ErrorState variant="empty" compact message="Este report no admite torta." />
          </div>
        );
      }
      return (
        <WidgetDonut
          titulo={titulo ?? data.label}
          slices={data.slices}
          editing={editing}
          onRemove={remove}
        />
      );
    }

    if (data.kind === 'numero') {
      return (
        <WidgetKpiNumero
          titulo={titulo}
          value={fmtValorMetrica(data.value, data.iva)}
          label={data.label}
          delta={w.viz === 'numero_delta' || data.delta ? data.delta : undefined}
          dir={data.dir}
          editing={editing}
          onRemove={remove}
        />
      );
    }

    return (
      <div className={styles.panelBox} style={{ padding: 16, height: '100%' }}>
        <ErrorState variant="empty" compact message="Widget no disponible." />
      </div>
    );
  };

  if (cargando || !hydrated) {
    return (
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <CardsSkeleton cards={2} />
        <CardsSkeleton cards={2} />
      </div>
    );
  }

  return (
    <div className={styles.dashRoot}>
      <DashboardToolbar
        dashboards={snapshot.dashboards}
        activeId={activeDashboard.id}
        editing={editing}
        dirty={dirty}
        onSelect={(id) => {
          persist(marcarUltimoDashboard(snapshot, id));
        }}
        onEdit={() => {
          setDraft(structuredClone(activeDashboard));
          setEditing(true);
        }}
        onSave={() => {
          if (!draft) return;
          persist(upsertDashboard(snapshot, draft));
          setEditing(false);
          setDraft(null);
          setAddOpen(false);
        }}
        onDiscard={() => {
          setEditing(false);
          setDraft(null);
          setAddOpen(false);
        }}
        onAddWidget={() => {
          if (!editing) {
            setDraft(structuredClone(activeDashboard));
            setEditing(true);
          }
          setAddOpen(true);
        }}
        onDuplicate={() => {
          const next = duplicarDashboard(snapshot, activeDashboard.id);
          persist(next);
        }}
        onRename={() => {
          const nombre = window.prompt('Nombre del dashboard', activeDashboard.nombre);
          if (!nombre?.trim()) return;
          persist(upsertDashboard(snapshot, { ...activeDashboard, nombre: nombre.trim() }));
        }}
        onDelete={() => {
          if (!window.confirm('¿Eliminar este dashboard?')) return;
          persist(eliminarDashboard(snapshot, activeDashboard.id));
        }}
        onReset={() => {
          if (!window.confirm('¿Restablecer el layout a la plantilla?')) return;
          persist(resetDashboardAPlantilla(snapshot, activeDashboard.id));
        }}
        onNuevo={() => {
          const base = dashboardDesdePlantilla('operacion', {
            id: `usr-${Date.now().toString(36)}`,
            sistema: false,
            nombre: 'Mi dashboard',
          });
          const nombre = window.prompt('Nombre del nuevo dashboard', base.nombre);
          if (!nombre?.trim()) return;
          persist(upsertDashboard(snapshot, { ...base, nombre: nombre.trim() }));
        }}
      />

      <div className={styles.dashBody}>
        {widgets.length === 0 ? (
          <ErrorState
            variant="empty"
            title="Dashboard vacío"
            message={editing ? 'Añade un widget desde el panel lateral.' : 'Edita el dashboard para añadir widgets.'}
          />
        ) : (
          <DashboardGrid
            widgets={widgets}
            editing={editing}
            onWidgetsChange={setWidgets}
            renderWidget={renderWidget}
          />
        )}
        <AddWidgetPanel open={addOpen && editing} onClose={() => setAddOpen(false)} onAdd={onAddWidget} />
      </div>

      <Eyebrow style={{ paddingBottom: 8 }}>
        {conductor('d1') ? 'Mapa · última ubicación de la app del conductor.' : ''}
      </Eyebrow>
    </div>
  );
}
