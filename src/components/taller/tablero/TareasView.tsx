'use client';

import { DragEvent, useMemo, useState } from 'react';
import { COLUMNAS_TAREA, type TareaKanban } from '@/lib/mecanu/pipeline-tareas';
import type { ColumnaTareaPipeline } from '@/lib/mecanu/types';
import { usePanel } from '../store';
import { CardsSkeleton } from '../ui/Primitives';
import { useCarga } from '../ui/useCarga';
import { TareaCard } from './TareaCard';
import styles from '../panel.module.css';

function colorCol(kind: (typeof COLUMNAS_TAREA)[number]['kind']): string {
  if (kind === 'brand') return 'var(--mecanu-electric-600)';
  return `var(--mecanu-${kind})`;
}

export function TareasView() {
  const p = usePanel();
  const cargando = useCarga();
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropCol, setDropCol] = useState<ColumnaTareaPipeline | null>(null);

  const plana = useMemo(
    () => COLUMNAS_TAREA.flatMap((c) => p.pipelineTareas[c.id]),
    [p.pipelineTareas],
  );
  const arrastrada = plana.find((t) => t.id === dragId) ?? null;

  const onDrop = (e: DragEvent<HTMLDivElement>, hacia: ColumnaTareaPipeline) => {
    e.preventDefault();
    setDropCol(null);
    const id = e.dataTransfer.getData('text/plain') || dragId;
    setDragId(null);
    if (!id) return;
    p.moverTareaPipeline(id, hacia);
  };

  if (cargando) {
    return (
      <div style={{ flex: 1, minHeight: 0 }}>
        <CardsSkeleton cards={4} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className={styles.kanban} style={{ flex: 1, minHeight: 0, display: 'flex', gap: 12, paddingBottom: 6 }}>
        {COLUMNAS_TAREA.map((col) => {
          const items = p.pipelineTareas[col.id];
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
                    arrastrando={dragId === t.id}
                    onDragStart={(e) => {
                      setDragId(t.id);
                      e.dataTransfer.setData('text/plain', t.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => { setDragId(null); setDropCol(null); }}
                    onClick={() => p.abrirDeber(t.deber)}
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

      <p style={{ margin: 0, fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
        La tarjeta avanza a Hecho al cerrar el hueco, no al arrastrarla. Cancelado = no la hago. Un seguimiento al cliente se puede archivar.
      </p>
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
