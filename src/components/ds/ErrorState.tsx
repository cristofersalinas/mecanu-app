import type { CSSProperties } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

export type ErrorStateVariant = 'empty' | 'error' | 'offline' | 'permission';

export interface ErrorStateProps {
  variant?: ErrorStateVariant;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  style?: CSSProperties;
}

const VARIANTS: Record<ErrorStateVariant, { icon: string; tint: string; title: string }> = {
  empty: { icon: 'inbox', tint: 'var(--mecanu-text-disabled-light)', title: 'Sin resultados' },
  error: { icon: 'error', tint: 'var(--mecanu-alert)', title: 'No se pudo cargar' },
  offline: { icon: 'wifi_off', tint: 'var(--mecanu-warning)', title: 'Sin conexión' },
  permission: { icon: 'lock', tint: 'var(--mecanu-warning)', title: 'Permiso necesario' },
};

export function ErrorState({ variant = 'error', title, message, actionLabel, onAction, compact = false, style }: ErrorStateProps) {
  const v = VARIANTS[variant] ?? VARIANTS.error;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 'var(--mecanu-space-3)',
        padding: compact ? 'var(--mecanu-space-6)' : 'var(--mecanu-space-10) var(--mecanu-space-6)',
        fontFamily: 'var(--mecanu-font-family)',
        ...style,
      }}
    >
      <Icon name={v.icon} size="xl" color={v.tint} />
      <div>
        <div style={{ fontSize: 'var(--mecanu-font-size-h4)', lineHeight: 'var(--mecanu-line-height-h4)', fontWeight: 700, color: 'var(--mecanu-text-primary-light)' }}>
          {title || v.title}
        </div>
        {message ? (
          <div style={{ fontSize: 'var(--mecanu-font-size-caption)', lineHeight: 'var(--mecanu-line-height-caption)', color: 'var(--mecanu-text-secondary-light)', marginTop: 4, maxWidth: 320 }}>
            {message}
          </div>
        ) : null}
      </div>
      {onAction ? (
        <Button kind="secondary" size="compact" icon={variant === 'offline' || variant === 'error' ? 'refresh' : undefined} onClick={onAction}>
          {actionLabel || 'Reintentar'}
        </Button>
      ) : null}
    </div>
  );
}
