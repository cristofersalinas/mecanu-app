'use client';

import { DragEvent } from 'react';
import { Badge } from '@/components/ds/Badge';
import { Icon } from '@/components/ds/Icon';
import { URGENCIA_ETIQUETA } from '@/lib/mecanu/deberes-taller';
import { TIPO_TAREA_META, type TareaKanban } from '@/lib/mecanu/pipeline-tareas';
import styles from '../panel.module.css';

interface Props {
  tarea: TareaKanban;
  enCurso: boolean;
  arrastrando: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onClick: () => void;
  onReabrir?: () => void;
}

export function TareaCard({
  tarea, enCurso, arrastrando, onDragStart, onDragEnd, onClick, onReabrir,
}: Props) {
  const meta = TIPO_TAREA_META[tarea.deber.tipo];
  const hecha = tarea.columna === 'hecho' || tarea.columna === 'cancelado';
  const detalle = tarea.deber.detalle.trim();

  return (
    <div
      className={`${styles.card} ${arrastrando ? styles.cardDragging : ''} ${enCurso ? styles.cardEnCurso : ''}`}
      draggable={tarea.arrastrable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{ cursor: tarea.arrastrable ? 'grab' : 'pointer', opacity: hecha ? 0.78 : 1 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 999,
            background: 'var(--mecanu-neutral-25)', fontSize: 11, fontWeight: 700,
            color: 'var(--mecanu-text-secondary-light)',
          }}
        >
          <Icon name={meta.icono} size="sm" />
          {meta.corto}
        </span>
        {!hecha ? (
          <Badge kind={URGENCIA_ETIQUETA[tarea.deber.urgencia].kind} dot>
            {URGENCIA_ETIQUETA[tarea.deber.urgencia].label}
          </Badge>
        ) : null}
        <span style={{ flex: 1 }} />
        {hecha && onReabrir ? (
          <button
            type="button"
            className={styles.iconBtn}
            style={{ width: 'auto', minWidth: 24, height: 24, padding: '0 8px', fontSize: 11, fontWeight: 700 }}
            onClick={(e) => { e.stopPropagation(); onReabrir(); }}
          >
            Reabrir
          </button>
        ) : (
          <Icon name="chevron_right" size="sm" color="var(--mecanu-neutral-300)" />
        )}
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {tarea.deber.titulo}
      </div>
      {detalle ? (
        <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {detalle}
        </div>
      ) : null}
    </div>
  );
}
