'use client';

import { useCallback, useRef, useState } from 'react';
import { Icon } from '@/components/ds/Icon';
import css from './conductor.module.css';

const MANTENER_MS = 1200;

/**
 * Botón de siniestro: se activa manteniéndolo pulsado.
 * Congelar un viaje es irreversible desde el móvil, así que no puede dispararse
 * con un roce. El design system aún no exporta `IncidentButton`.
 * TODO DS: sustituir por `@/components/ds/IncidentButton` cuando exista.
 */
export function IncidentButton({ label, onActivate }: { label: string; onActivate: () => void }) {
  const [pulsando, setPulsando] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const soltar = useCallback(() => {
    window.clearTimeout(timer.current);
    setPulsando(false);
  }, []);

  const pulsar = useCallback(() => {
    setPulsando(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setPulsando(false);
      onActivate();
    }, MANTENER_MS);
  }, [onActivate]);

  return (
    <button
      type="button"
      onPointerDown={pulsar}
      onPointerUp={soltar}
      onPointerLeave={soltar}
      onPointerCancel={soltar}
      aria-label={label}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 56,
        overflow: 'hidden',
        border: '1px solid #F3C2C6',
        borderRadius: 10,
        background: '#FCE0E2',
        color: '#A81823',
        font: 'inherit',
        fontSize: 15,
        fontWeight: 800,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        touchAction: 'none',
      }}
    >
      <span className={`${css.holdBarra} ${pulsando ? css.holdActivo : ''}`} />
      <Icon name="crisis_alert" size="lg" filled style={{ position: 'relative' }} />
      <span style={{ position: 'relative' }}>{label}</span>
    </button>
  );
}
