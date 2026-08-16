'use client';

import { Icon } from '@/components/ds/Icon';
import { TESTIGOS } from './constants';

/**
 * Los 8 testigos del cuadro. Lista cerrada.
 * Los cuatro rojos bloquean la marcha al sellar el check-in; los cuatro ámbar
 * generan hallazgo para Campañas, pero no impiden conducir.
 */
export function TestigosGrid({
  marcados,
  onToggle,
}: {
  marcados: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
      {TESTIGOS.map((t) => {
        const on = marcados.includes(t.key);
        const col = t.nivel === 'rojo' ? '#A81823' : '#9C420B';
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onToggle(t.key)}
            aria-pressed={on}
            aria-label={t.label}
            style={{
              minHeight: 68,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              border: '1px solid ' + (on ? col : 'var(--mecanu-border)'),
              borderRadius: 10,
              background: on ? (t.nivel === 'rojo' ? '#FCE0E2' : '#FDEBDD') : 'var(--mecanu-neutral-0)',
              cursor: 'pointer',
              font: 'inherit',
              padding: '6px 2px',
            }}
          >
            <Icon name={t.icono} size="lg" filled color={on ? col : 'var(--mecanu-neutral-300)'} />
            <span
              style={{
                fontSize: 10,
                lineHeight: '12px',
                fontWeight: 800,
                textAlign: 'center',
                color: on ? col : 'var(--mecanu-neutral-700)',
              }}
            >
              {t.corto}
            </span>
          </button>
        );
      })}
    </div>
  );
}
