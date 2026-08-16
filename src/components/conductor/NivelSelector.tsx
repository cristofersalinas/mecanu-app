'use client';

import { Icon } from '@/components/ds/Icon';
import { NIVELES } from './constants';
import type { Nivel } from './types';

/**
 * Escala canónica 1-4. El dato guardado es el número; lo que lee el conductor
 * cambia por ítem — no se pregunta cuánto le queda a una pieza, sino hasta
 * cuándo aguanta.
 */
export function NivelSelector({
  copys,
  valor,
  onElegir,
}: {
  copys: string[];
  valor: Nivel | undefined;
  onElegir: (n: Nivel) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {copys.map((copy, i) => {
        const nv = NIVELES[i]!;
        const on = valor === nv.n;
        return (
          <button
            key={nv.n}
            type="button"
            onClick={() => onElegir(nv.n)}
            aria-pressed={on}
            style={{
              width: '100%',
              minHeight: 52,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              border: '1px solid ' + (on ? nv.borde : 'var(--mecanu-border)'),
              borderRadius: 9,
              background: on ? nv.bg : 'var(--mecanu-neutral-0)',
              padding: '7px 10px',
              cursor: 'pointer',
              font: 'inherit',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                flex: 'none',
                width: 26,
                height: 26,
                borderRadius: 999,
                background: on ? nv.color : 'var(--mecanu-neutral-25)',
                color: on ? '#fff' : 'var(--mecanu-neutral-700)',
                fontSize: 12,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {nv.n}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 13,
                  lineHeight: '17px',
                  fontWeight: 700,
                  color: 'var(--mecanu-neutral-900)',
                }}
              >
                {copy}
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: 10,
                  lineHeight: '13px',
                  fontWeight: 800,
                  letterSpacing: '.04em',
                  textTransform: 'uppercase',
                  color: nv.color,
                }}
              >
                {nv.titulo}
              </span>
            </span>
            {on ? <Icon name="check_circle" size="md" filled color={nv.color} style={{ flex: 'none' }} /> : null}
          </button>
        );
      })}
    </div>
  );
}
