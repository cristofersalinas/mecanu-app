'use client';

import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from './Icon';

export interface IncidentButtonProps {
  label?: string;
  holdMs?: number;
  onActivate?: () => void;
  style?: CSSProperties;
}

export function IncidentButton({ label = 'Reportar siniestro', holdMs = 1200, onActivate, style }: IncidentButtonProps) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (active) return;
    const t0 = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / holdMs);
      setProgress(p);
      if (p >= 1) {
        if (timer.current) clearInterval(timer.current);
        setActive(true);
        onActivate?.();
      }
    }, 30);
  };

  const cancel = () => {
    if (timer.current) clearInterval(timer.current);
    if (!active) setProgress(0);
  };

  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        minHeight: 56,
        border: 'none',
        borderRadius: 'var(--mecanu-radius-300)',
        background: active ? '#A81823' : 'var(--mecanu-alert)',
        color: 'var(--mecanu-neutral-0)',
        fontFamily: 'var(--mecanu-font-family)',
        fontWeight: 700,
        fontSize: 16,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--mecanu-space-2)',
        userSelect: 'none',
        touchAction: 'none',
        ...style,
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(22,23,24,.25)',
          transformOrigin: 'left',
          transform: `scaleX(${progress})`,
          transition: progress === 0 ? 'transform 200ms var(--mecanu-ease-responsive-accelerate)' : 'none',
        }}
      />
      <Icon name={active ? 'shield' : 'warning'} size="md" filled={active} style={{ position: 'relative' }} />
      <span style={{ position: 'relative' }}>{active ? 'Viaje congelado — seguro activo' : label}</span>
    </button>
  );
}
