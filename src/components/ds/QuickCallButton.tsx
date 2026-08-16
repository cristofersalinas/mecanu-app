import type { CSSProperties, MouseEventHandler } from 'react';
import { Icon } from './Icon';

export type QuickCallButtonContext = 'cliente' | 'taller';

export interface QuickCallButtonProps {
  context?: QuickCallButtonContext;
  fixed?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
}

export function QuickCallButton({ context = 'cliente', onClick, fixed = false, style }: QuickCallButtonProps) {
  const alert = context === 'taller';
  return (
    <button
      type="button"
      aria-label={`Llamar a ${context}`}
      onClick={onClick}
      style={{
        position: fixed ? 'fixed' : 'relative',
        right: fixed ? 16 : undefined,
        bottom: fixed ? 16 : undefined,
        width: 56,
        height: 56,
        borderRadius: 999,
        border: 'none',
        background: alert ? 'var(--mecanu-alert)' : 'var(--mecanu-brand-primary-dark)',
        color: alert ? 'var(--mecanu-neutral-0)' : 'var(--mecanu-text-primary-light)',
        boxShadow: 'var(--mecanu-shadow-deep)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
        ...style,
      }}
    >
      <Icon name="call" size="lg" />
    </button>
  );
}
