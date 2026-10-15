'use client';

import { DragEvent } from 'react';
import { Badge } from '@/components/ds/Badge';
import { Icon } from '@/components/ds/Icon';
import { URGENCIA_ETIQUETA } from '@/lib/mecanu/deberes-taller';
import { etiquetaMotivoTarea, TIPO_TAREA_META, type TareaKanban } from '@/lib/mecanu/pipeline-tareas';
import { usePanel } from '../store';
import { contextoTareaCard } from './tarea-card-copy';
import styles from '../panel.module.css';

const URGENCIA_COLOR: Record<string, string> = {
  alert: 'var(--mecanu-alert)',
  warning: 'var(--mecanu-warning)',
  info: 'var(--mecanu-info)',
};

interface Props {
  tarea: TareaKanban;
  enCurso: boolean;
  resaltada?: boolean;
  arrastrando: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onClick: () => void;
  onReabrir?: () => void;
}

export function TareaCard({
  tarea, enCurso, resaltada, arrastrando, onDragStart, onDragEnd, onClick, onReabrir,
}: Props) {
  const p = usePanel();
  const meta = TIPO_TAREA_META[tarea.deber.tipo];
  const esPendiente = tarea.columna === 'pendiente';
  const esCancelada = tarea.columna === 'cancelado';
  const puedeReabrir = Boolean(onReabrir);
  const detalle = tarea.deber.detalle.trim();
  const { nombreCliente, lineaVehiculo } = contextoTareaCard(tarea.deber, {
    rutaPorId: p.rutaPorId,
    campanaPorId: p.campanaPorId,
  });
  const origenLabel = tarea.deber.entidadKind === 'campana' ? 'Campaña' : 'Traslados';
  const urgencia = URGENCIA_ETIQUETA[tarea.deber.urgencia];

  return (
    <div
      className={`${styles.card} ${arrastrando ? styles.cardDragging : ''} ${enCurso ? styles.cardEnCurso : ''} ${resaltada ? styles.cardSiguiente : ''}`}
      draggable={tarea.arrastrable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={esPendiente ? onClick : undefined}
      style={{ cursor: tarea.arrastrable ? 'grab' : esPendiente ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className={styles.tareaChip}>
          <Icon name={meta.icono} size="sm" />
          {meta.corto}
        </span>
        <span className={`${styles.tareaChip} ${styles.tareaChipOrigen}`}>
          {origenLabel}
        </span>
        {!esPendiente && !esCancelada ? (
          <Badge kind="positive" dot={false}>Hecho</Badge>
        ) : null}
        <span style={{ flex: 1 }} />
        {puedeReabrir ? (
          <button
            type="button"
            className={styles.iconBtn}
            style={{ width: 'auto', minWidth: 24, height: 24, padding: '0 8px', fontSize: 11, fontWeight: 700 }}
            onClick={(e) => { e.stopPropagation(); onReabrir!(); }}
          >
            Reabrir
          </button>
        ) : (
          <Icon name="chevron_right" size="sm" color="var(--mecanu-neutral-300)" />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <Icon name="person" size="sm" color="var(--mecanu-text-secondary-light)" />
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {nombreCliente}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <Icon name="directions_car" size="sm" color="var(--mecanu-text-secondary-light)" />
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {lineaVehiculo}
        </span>
      </div>

      {detalle && !esCancelada ? (
        <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {detalle}
        </div>
      ) : null}

      {esPendiente ? (
        <div className={styles.tareaUrgencia}>
          <span
            className={styles.tareaUrgenciaDot}
            style={{ background: URGENCIA_COLOR[urgencia.kind] }}
            aria-hidden
          />
          {urgencia.label}
        </div>
      ) : null}

      {esCancelada && tarea.cancelacion ? (
        <div
          style={{
            marginTop: 2,
            padding: '8px 9px',
            borderRadius: 8,
            background: 'var(--mecanu-neutral-25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            minWidth: 0,
          }}
        >
          <Badge kind="alert" dot={false}>
            {etiquetaMotivoTarea(tarea.cancelacion.categoria)}
          </Badge>
          <div
            style={{
              fontSize: 12,
              lineHeight: '16px',
              color: 'var(--mecanu-text-secondary-light)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {tarea.cancelacion.detalle}
          </div>
        </div>
      ) : null}
    </div>
  );
}
