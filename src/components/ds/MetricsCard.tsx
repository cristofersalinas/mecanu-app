import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';

export type MetricsCardDeltaDirection = 'up' | 'down';

export interface MetricsCardProps {
  value?: ReactNode;
  label?: ReactNode;
  delta?: ReactNode;
  deltaDirection?: MetricsCardDeltaDirection;
  style?: CSSProperties;
}

export function MetricsCard({ value, label, delta, deltaDirection, style }: MetricsCardProps) {
  const up = deltaDirection === 'up';
  const deltaColor = deltaDirection ? (up ? 'var(--mecanu-positive)' : 'var(--mecanu-alert)') : 'var(--mecanu-text-secondary-light)';
  return (
    <div
      style={{
        background: 'var(--mecanu-bg-secondary-light)',
        borderRadius: 'var(--mecanu-radius-200)',
        padding: 'var(--mecanu-space-5) var(--mecanu-space-6)',
        fontFamily: 'var(--mecanu-font-family)',
        minWidth: 180,
        flex: '1 1 0',
        ...style,
      }}
    >
      <div style={{ fontSize: 'var(--mecanu-font-size-display)', lineHeight: 'var(--mecanu-line-height-display)', fontWeight: 700 }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--mecanu-space-2)', marginTop: 'var(--mecanu-space-1)' }}>
        <span style={{ fontSize: 'var(--mecanu-font-size-caption)', lineHeight: 'var(--mecanu-line-height-caption)', color: 'var(--mecanu-text-secondary-light)' }}>
          {label}
        </span>
        {delta ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              whiteSpace: 'nowrap',
              flex: 'none',
              fontSize: 'var(--mecanu-font-size-caption)',
              fontWeight: 700,
              color: deltaColor,
            }}
          >
            {deltaDirection ? <Icon name={up ? 'arrow_upward' : 'arrow_downward'} size="sm" /> : null}
            {delta}
          </span>
        ) : null}
      </div>
    </div>
  );
}
