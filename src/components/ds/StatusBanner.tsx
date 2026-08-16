import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';

export type StatusBannerKind = 'dark' | 'brand' | 'warning' | 'alert';

export interface StatusBannerProps {
  icon?: string;
  kind?: StatusBannerKind;
  children?: ReactNode;
  action?: ReactNode;
  onAction?: () => void;
  style?: CSSProperties;
}

export function StatusBanner({ icon = 'shield', kind = 'dark', children, action, onAction, style }: StatusBannerProps) {
  const bg = kind === 'dark' ? 'var(--mecanu-bg-secondary-dark)' : kind === 'warning' ? '#FDEBDD' : kind === 'alert' ? '#FCE0E2' : 'var(--mecanu-electric-100)';
  const fg = kind === 'dark' ? 'var(--mecanu-text-primary-dark)' : kind === 'warning' ? '#9C420B' : kind === 'alert' ? '#A81823' : 'var(--mecanu-emerald-800)';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--mecanu-space-2)',
        background: bg,
        color: fg,
        padding: 'var(--mecanu-space-2) var(--mecanu-space-4)',
        fontFamily: 'var(--mecanu-font-family)',
        fontSize: 'var(--mecanu-font-size-h5)',
        lineHeight: 'var(--mecanu-line-height-h5)',
        fontWeight: 700,
        ...style,
      }}
      role="status"
    >
      <Icon name={icon} size="sm" />
      <span style={{ flex: 1 }}>{children}</span>
      {action ? (
        <button
          type="button"
          onClick={onAction}
          style={{
            border: 'none',
            background: 'none',
            color: 'inherit',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 800,
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {action}
        </button>
      ) : null}
    </div>
  );
}
