'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';
import { Badge } from '@/components/ds/Badge';
import { Icon } from '@/components/ds/Icon';
import { SOL_META } from './constants';
import { ventana } from './selectors';
import { CALL_W } from './useConductor';
import type { Job } from './types';
import css from './conductor.module.css';

/**
 * Card de un traslado de la jornada.
 * - R3: si hay una solicitud pendiente, su badge SUSTITUYE al de estado. Nunca dos.
 * - R5: en riesgo, la card cambia de fondo y el botón de navegar pasa a ser un aviso.
 * - R9: la cobertura va solo en icono, con `title`/`aria-label`, sin texto al lado.
 * - Deslizar revela el botón de llamar; llamar exige un segundo gesto.
 */
export function JobCard({
  job,
  dirTexto,
  flash,
  slideX,
  arrastrando,
  cajonAbierto,
  onAbrir,
  onNavegar,
  onAlertar,
  onLlamar,
  onDown,
  onMove,
  onUp,
}: {
  job: Job;
  dirTexto: string;
  flash: boolean;
  slideX: number;
  arrastrando: boolean;
  cajonAbierto: boolean;
  onAbrir: () => void;
  onNavegar: () => void;
  onAlertar: () => void;
  onLlamar: () => void;
  onDown: (e: ReactPointerEvent) => void;
  onMove: (e: ReactPointerEvent) => void;
  onUp: () => void;
}) {
  const v = ventana(job);
  const solPendiente = job.solicitud?.estado === 'pendiente' ? SOL_META[job.solicitud.tipo] : null;

  return (
    <div
      data-tid={job.tid}
      className={flash ? css.flash : undefined}
      style={{
        position: 'relative',
        background: job.riesgo ? '#FDF4EC' : 'var(--mecanu-neutral-0)',
        border: '1px solid ' + (job.riesgo ? '#EEC9A7' : 'var(--mecanu-border)'),
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          className={`${css.slide} ${arrastrando ? css.slideArrastrando : ''}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: CALL_W,
            transform: `translateX(${CALL_W + slideX}px)`,
            background: 'var(--mecanu-brand-primary-dark)',
          }}
        >
          <button
            type="button"
            onClick={onLlamar}
            tabIndex={cajonAbierto ? 0 : -1}
            aria-hidden={!cajonAbierto}
            aria-label="Para, llama al cliente"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'none',
              color: 'var(--mecanu-neutral-900)',
              cursor: 'pointer',
              font: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Icon name="call" size="lg" />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.02em', textAlign: 'center', lineHeight: '13px' }}>
              Para, llama
            </span>
          </button>
        </div>

        <div
          style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '8px 4px 8px 10px' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <button
            type="button"
            onClick={onAbrir}
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: 'left',
              border: 'none',
              background: 'none',
              padding: '2px 0',
              cursor: 'pointer',
              font: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%' }}>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '.04em',
                    textTransform: 'uppercase',
                    color: 'var(--mecanu-neutral-700)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {job.rol}
                </span>
                <Icon
                  name={job.segIcon}
                  size="md"
                  filled
                  color={job.segColor}
                  style={{ flex: 'none' }}
                />
                <span className="sr-only" style={SR_ONLY}>
                  {job.segTitulo}
                </span>
              </span>
              <Badge kind={solPendiente ? 'warning' : job.estadoKind}>
                {solPendiente ? solPendiente.badge : job.estado}
              </Badge>
            </span>
            <span
              style={{
                fontSize: 15,
                lineHeight: '20px',
                fontWeight: 700,
                color: 'var(--mecanu-neutral-900)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
              }}
            >
              {job.matricula} · {job.veh}
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                lineHeight: '18px',
                minWidth: 0,
                width: '100%',
              }}
            >
              <span style={{ flex: 'none', fontWeight: 700, color: v.color }}>{v.texto}</span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  color: 'var(--mecanu-neutral-700)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {dirTexto}
              </span>
            </span>
          </button>

          {job.riesgo ? (
            <button
              type="button"
              className={css.tap}
              onClick={onAlertar}
              aria-label="Vas atrasado · ver aviso"
              style={{
                flex: 'none',
                width: 48,
                height: 48,
                marginTop: 2,
                marginRight: 5,
                border: '1px solid #DDA57A',
                borderRadius: 8,
                background: '#FDEBDD',
                color: '#9C420B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="warning" size="lg" filled />
            </button>
          ) : (
            <button
              type="button"
              className={css.tap}
              onClick={onNavegar}
              aria-label="Navegar con Google Maps"
              style={{
                flex: 'none',
                width: 48,
                height: 48,
                marginTop: 2,
                marginRight: 5,
                border: '1px solid var(--mecanu-border)',
                borderRadius: 8,
                background: 'var(--mecanu-neutral-0)',
                color: 'var(--mecanu-neutral-900)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="navigation" size="lg" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const SR_ONLY = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;
