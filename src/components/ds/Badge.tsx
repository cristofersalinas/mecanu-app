import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';

export type BadgeKind = 'info' | 'warning' | 'positive' | 'alert' | 'neutral' | 'brand';

export interface BadgeProps {
  kind?: BadgeKind;
  dot?: boolean;
  icon?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

const KINDS: Record<BadgeKind, { bg: string; fg: string; dot: string }> = {
  info: { bg: '#E3EDFB', fg: '#1D4E9C', dot: 'var(--mecanu-info)' },
  warning: { bg: '#FDEBDD', fg: '#9C420B', dot: 'var(--mecanu-warning)' },
  positive: { bg: '#E4FBDA', fg: 'var(--mecanu-positive)', dot: 'var(--mecanu-positive)' },
  alert: { bg: '#FCE0E2', fg: '#A81823', dot: 'var(--mecanu-alert)' },
  neutral: { bg: 'var(--mecanu-neutral-25)', fg: 'var(--mecanu-neutral-700)', dot: 'var(--mecanu-neutral-300)' },
  brand: { bg: 'var(--mecanu-electric-100)', fg: 'var(--mecanu-emerald-800)', dot: 'var(--mecanu-electric-600)' },
};

export function Badge({ kind = 'neutral', dot = true, icon, children, style }: BadgeProps) {
  const k = KINDS[kind] ?? KINDS.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--mecanu-space-1)',
        borderRadius: 'var(--mecanu-radius-full)',
        fontFamily: 'var(--mecanu-font-family)',
        fontSize: 'var(--mecanu-font-size-caption)',
        lineHeight: 'var(--mecanu-line-height-caption)',
        fontWeight: 'var(--mecanu-font-weight-bold)',
        padding: '2px 10px',
        whiteSpace: 'nowrap',
        background: k.bg,
        color: k.fg,
        ...style,
      }}
    >
      {icon ? (
        <Icon name={icon} size="sm" />
      ) : dot ? (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: k.dot,
            flex: 'none',
          }}
        />
      ) : null}
      {children}
    </span>
  );
}
