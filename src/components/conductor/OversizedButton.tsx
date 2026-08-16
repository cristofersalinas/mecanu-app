'use client';

import type { ReactNode } from 'react';
import { Icon } from '@/components/ds/Icon';
import css from './conductor.module.css';

/**
 * Botón de acción anclado al pie de la pantalla. El design system todavía no
 * exporta `OversizedButton`; esta es la versión mínima que necesita el conductor
 * (una sola acción, a pulgar, con estado bloqueado legible).
 * TODO DS: sustituir por `@/components/ds/OversizedButton` cuando exista.
 */
export function OversizedButton({
  icon,
  disabled,
  onClick,
  children,
  kind = 'primary',
}: {
  icon?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  kind?: 'primary' | 'negative';
}) {
  const fondo = disabled
    ? 'var(--mecanu-neutral-100)'
    : kind === 'negative'
      ? 'var(--mecanu-alert)'
      : 'var(--mecanu-brand-primary-dark)';
  const color = disabled
    ? 'var(--mecanu-neutral-300)'
    : kind === 'negative'
      ? 'var(--mecanu-neutral-0)'
      : 'var(--mecanu-neutral-900)';
  return (
    <button
      type="button"
      className={css.tap}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 56,
        border: 'none',
        borderRadius: 0,
        background: fondo,
        color,
        font: 'inherit',
        fontSize: 16,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        cursor: disabled ? 'default' : 'pointer',
        padding: '0 16px',
      }}
    >
      {icon ? <Icon name={icon} size="md" /> : null}
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {children}
      </span>
    </button>
  );
}
