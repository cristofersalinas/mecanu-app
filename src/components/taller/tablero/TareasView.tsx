'use client';

import { DragEvent, useMemo, useState } from 'react';
import { ErrorState } from '@/components/ds/ErrorState';
import { MetricsCard } from '@/components/ds/MetricsCard';
import { COLUMNAS_TAREA, TIPO_TAREA_META, type TareaKanban } from '@/lib/mecanu/pipeline-tareas';
import { kpisTareas } from '@/lib/mecanu/kpis-panel';
import type { ColumnaTareaPipeline } from '@/lib/mecanu/types';
import { usePanel } from '../store';
import { usePanelUrlFiltros } from '../usePanelUrlFiltros';
import { CardsSkeleton, SearchInput } from '../ui/Primitives';
import { useCarga } from '../ui/useCarga';
import { TareaCard } from './TareaCard';
import { CancelarTareaModal } from './CancelarTareaModal';
import { contextoTareaCard } from './tarea-card-copy';
import { WhatsAppPanel } from '../campanas/WhatsAppPanel';
import { SidePanel } from '../ficha/SidePanel';
import styles from '../panel.module.css';

function colorCol(kind: (typeof COLUMNAS_TAREA)[number]['kind']): string {
  if (kind === 'brand') return 'var(--mecanu-electric-600)';
  return `var(--mecanu-${kind})`;
}

function coincideBusqueda(
  t: TareaKanban,
  q: string,
  ctx: Parameters<typeof contextoTareaCard>[1],
): boolean {
  const meta = TIPO_TAREA_META[t.deber.tipo];
  const { nombreCliente, lineaVehiculo } = contextoTareaCard(t.deber, ctx);
  const blob = [
    t.deber.titulo, t.deber.detalle, meta.corto, t.deber.entidadId, t.id,
    nombreCliente, lineaVehiculo,
  ].filter(Boolean).join(' ').toLowerCase();
  return blob.includes(q);
}

export function TareasView() {
  const p = usePanel();
  const { filtros, setFiltro } = usePanelUrlFiltros();
  const cargando = useCarga();
  const busqueda = filtros.q ?? '';
  const setBusqueda = (v: string) => setFiltro('q', v || undefined);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropCol, setDropCol] = useState<ColumnaTareaPipeline | null>(null);
  const [cancelarTareaId, setCancelarTareaId] = useState<string | null>(null);

  const totalTareas = useMemo(
    () => COLUMNAS_TAREA.reduce((n, c) => n + p.pipelineTareas[c.id].length, 0),
    [p.pipelineTareas],
  );

  const pipelineFiltrado = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return p.pipelineTareas;
    const ctx = { rutaPorId: p.rutaPorId, campanaPorId: p.campanaPorId };
    return {
      pendiente: p.pipelineTareas.pendiente.filter((t) => coincideBusqueda(t, q, ctx)),
      hecho: p.pipelineTareas.hecho.filter((t) => coincideBusqueda(t, q, ctx)),
      cancelado: p.pipelineTareas.cancelado.filter((t) => coincideBusqueda(t, q, ctx)),
    } as Record<ColumnaTareaPipeline, TareaKanban[]>;
  }, [p.pipelineTareas, p.rutaPorId, p.campanaPorId, busqueda]);

  const filtradasN = useMemo(
    () => COLUMNAS_TAREA.reduce((n, c) => n + pipelineFiltrado[c.id].length, 0),
    [pipelineFiltrado],
  );

  const kpis = useMemo(() => kpisTareas(p.pipelineTareas), [p.pipelineTareas]);

  const plana = useMemo(
    () => COLUMNAS_TAREA.flatMap((c) => pipelineFiltrado[c.id]),
    [pipelineFiltrado],
  );
  const arrastrada = plana.find((t) => t.id === dragId) ?? null;

  const onDrop = (e: DragEvent<HTMLDivElement>, hacia: ColumnaTareaPipeline) => {
    e.preventDefault();
    setDropCol(null);
    const id = e.dataTransfer.getData('text/plain') || dragId;
    setDragId(null);
    if (!id) return;
    if (hacia === 'cancelado') {
      setCancelarTareaId(id);
      return;
    }
    p.moverTareaPipeline(id, hacia);
  };

  const tareaCancelar = cancelarTareaId
    ? plana.find((t) => t.id === cancelarTareaId) ?? p.pipelineTareas.pendiente.find((t) => t.id === cancelarTareaId) ?? null
    : null;

  const campanaDeberId = p.deberActivo?.entidadKind === 'campana' ? p.deberActivo.entidadId : null;
  const sidebarRutaDeber = p.deberActivo?.entidadKind === 'ruta'
    && p.seleccion?.kind === 'ruta'
    && p.modoFicha === 'panel';

  const abrirTarea = (t: TareaKanban) => {
    if (t.columna === 'hecho') return;
    if (p.deberActivo?.id === t.id) {
      p.volverDeDeber();
      return;
    }
    p.limpiarTareaResaltada();
    p.abrirDeber(t.deber);
  };

  if (cargando) {
    return (
      <div style={{ flex: 1, minHeight: 0 }}>
        <CardsSkeleton cards={4} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, position: 'relative', minWidth: 0 }}>
      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, minHeight: 0 }}>
      <div className="mcn-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        {kpis.map((k) => (
          <MetricsCard key={k.id} value={k.value} label={k.label} />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <SearchInput
          placeholder="Buscar tarea, tipo o referencia"
          value={busqueda}
          onChange={setBusqueda}
        />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
          {filtradasN} de {totalTareas} tareas
        </span>
      </div>

      {filtradasN === 0 ? (
        <div style={{ padding: '32px 0' }}>
          <ErrorState
            variant="empty"
            title="Sin tareas con ese filtro"
            message="No hay tareas que coincidan. Prueba otra búsqueda o vacía el texto."
            actionLabel="Limpiar búsqueda"
            onAction={() => setBusqueda('')}
          />
        </div>
      ) : (
      <div className={styles.kanban} style={{ flex: 1, minHeight: 0, display: 'flex', gap: 12, paddingBottom: 6 }}>
        {COLUMNAS_TAREA.map((col) => {
          const items = pipelineFiltrado[col.id];
          const activa = dropCol === col.id;
          const puedeSoltar = puedeSoltarColumna(col.id, arrastrada);
          return (
            <div
              key={col.id}
              className={`${styles.colExpanded} ${styles.kanbanCol} ${activa ? (puedeSoltar ? styles.colDropActive : styles.colDropDenied) : ''}`}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                setDropCol(col.id);
                e.dataTransfer.dropEffect = puedeSoltar ? 'move' : 'none';
              }}
              onDragLeave={() => setDropCol((c) => (c === col.id ? null : c))}
              onDrop={(e) => onDrop(e, col.id)}
              style={{
                width: 268, borderRadius: 12, background: 'var(--mecanu-neutral-25)',
              }}
            >
              <div className={styles.kanbanColHead}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 4px 0' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: colorCol(col.kind) }} />
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    {col.label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mecanu-neutral-300)' }}>{items.length}</span>
                </div>
                {col.hint ? (
                  <div style={{ fontSize: 11, color: 'var(--mecanu-text-secondary-light)', padding: '6px 4px 0' }}>
                    {col.hint}
                  </div>
                ) : null}
              </div>
              <div className={styles.kanbanColBody}>
                {items.map((t) => (
                  <TareaCard
                    key={t.id}
                    tarea={t}
                    enCurso={p.deberActivo?.id === t.id}
                    resaltada={p.tareaResaltadaId === t.id}
                    arrastrando={dragId === t.id}
                    onDragStart={(e) => {
                      setDragId(t.id);
                      e.dataTransfer.setData('text/plain', t.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => { setDragId(null); setDropCol(null); }}
                    onClick={() => abrirTarea(t)}
                    onReabrir={(t.columna === 'cancelado' || (t.columna === 'hecho' && t.via === 'archivada'))
                      ? () => p.reabrirTareaPipeline(t.id)
                      : undefined}
                  />
                ))}
                {items.length === 0 ? (
                  <div style={{ padding: '18px 10px', textAlign: 'center', fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>
                    {col.empty}
                    {activa && !puedeSoltar ? (
                      <div style={{ marginTop: 6, color: '#9C420B' }}>No se puede soltar aquí</div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      )}

      <p style={{ margin: 0, fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
        La tarjeta avanza a Hecho al cerrar el hueco, no al arrastrarla. Cancelado = no la hago. Un seguimiento al cliente se puede archivar.
      </p>

      <CancelarTareaModal
        open={!!tareaCancelar}
        titulo={tareaCancelar ? contextoTareaCard(tareaCancelar.deber, {
          rutaPorId: p.rutaPorId,
          campanaPorId: p.campanaPorId,
        }).nombreCliente : ''}
        onClose={() => setCancelarTareaId(null)}
        onConfirm={(cancelacion) => {
          if (cancelarTareaId) p.cancelarTareaPipeline(cancelarTareaId, cancelacion);
          setCancelarTareaId(null);
        }}
      />
      </div>

      {sidebarRutaDeber || campanaDeberId ? (
        <div className={styles.sidebarCompactOverlay} data-sidebar-compact>
          {sidebarRutaDeber ? <SidePanel /> : null}
          {campanaDeberId ? (
            <WhatsAppPanel
              key={`${campanaDeberId}-${p.deberActivo?.id ?? ''}`}
              campanaId={campanaDeberId}
              onCerrar={() => p.volverDeDeber()}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function puedeSoltarColumna(hacia: ColumnaTareaPipeline, card: TareaKanban | null): boolean {
  if (!card) return hacia === 'cancelado';
  if (card.columna === hacia) return true;
  if (card.columna !== 'pendiente') return false;
  if (hacia === 'cancelado') return true;
  if (hacia === 'hecho') return card.deber.tipo === 'recordar_oferta';
  return false;
}
