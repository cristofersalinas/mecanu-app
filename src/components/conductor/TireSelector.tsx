'use client';

import { Icon } from '@/components/ds/Icon';
import { NIVELES, RUEDAS, RUEDA_COPY } from './constants';
import { NivelSelector } from './NivelSelector';
import type { Nivel } from './types';
import css from './conductor.module.css';

/**
 * Diagrama de las cuatro ruedas visto desde arriba. Se toca la rueda y se
 * responde con la misma escala 1-4 que el resto de la inspección.
 */
export function TireSelector({
  valores,
  abierta,
  onAbrir,
  onElegir,
}: {
  valores: Record<string, Nivel>;
  abierta: string | null;
  onAbrir: (key: string | null) => void;
  onElegir: (key: string, n: Nivel) => void;
}) {
  const faltan = RUEDAS.filter((r) => !valores[r.key]).length;
  const rs = abierta ? (RUEDAS.find((r) => r.key === abierta) ?? null) : null;

  return (
    <div style={{ border: '1px solid var(--mecanu-border)', borderRadius: 12, padding: 11 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="tire_repair" size="lg" color="var(--mecanu-neutral-700)" style={{ flex: 'none' }} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--mecanu-neutral-900)' }}>
            Neumáticos
          </span>
          <span
            style={{
              display: 'block',
              fontSize: 12,
              lineHeight: '16px',
              fontWeight: 700,
              color: faltan ? 'var(--mecanu-neutral-700)' : '#1E7300',
              marginTop: 1,
            }}
          >
            {faltan ? faltan + ' sin responder · toca cada rueda' : 'Las cuatro respondidas'}
          </span>
        </span>
      </div>

      <div style={{ position: 'relative', width: 178, height: 196, margin: '12px auto 2px' }}>
        <div
          style={{
            position: 'absolute',
            top: 14,
            bottom: 14,
            left: 38,
            right: 38,
            border: '2px solid var(--mecanu-neutral-200)',
            borderRadius: '30px 30px 22px 22px',
            background: 'var(--mecanu-neutral-25)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 52,
            left: 52,
            right: 52,
            height: 38,
            borderRadius: 10,
            background: 'var(--mecanu-neutral-0)',
            border: '1px solid var(--mecanu-border)',
          }}
        />
        {RUEDAS.map((r, idx) => {
          const val = valores[r.key];
          const nv = val ? NIVELES[val - 1]! : null;
          const izq = idx % 2 === 0;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => onAbrir(abierta === r.key ? null : r.key)}
              aria-label={r.label}
              aria-expanded={abierta === r.key}
              style={{
                position: 'absolute',
                top: idx < 2 ? 6 : 126,
                left: izq ? 0 : undefined,
                right: izq ? undefined : 0,
                width: 50,
                height: 64,
                border: '2px solid ' + (nv ? nv.color : 'var(--mecanu-border)'),
                borderRadius: 10,
                background: nv ? nv.bg : 'var(--mecanu-neutral-0)',
                cursor: 'pointer',
                font: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <span style={{ fontSize: 17, fontWeight: 800, color: nv ? nv.color : 'var(--mecanu-neutral-300)' }}>
                {val ?? '–'}
              </span>
              <span
                style={{
                  fontSize: 9,
                  lineHeight: '11px',
                  fontWeight: 800,
                  color: nv ? nv.color : 'var(--mecanu-neutral-300)',
                }}
              >
                {r.key.charAt(0) === 'd' ? 'Del.' : 'Tras.'}
              </span>
            </button>
          );
        })}
      </div>

      {rs ? (
        <div
          className={css.fade}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            marginTop: 8,
            borderTop: '1px solid var(--mecanu-border-subtle)',
            paddingTop: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              color: 'var(--mecanu-neutral-700)',
            }}
          >
            {rs.label}
          </div>
          <NivelSelector
            copys={RUEDA_COPY}
            valor={valores[rs.key]}
            onElegir={(n) => onElegir(rs.key, n)}
          />
        </div>
      ) : null}
    </div>
  );
}
