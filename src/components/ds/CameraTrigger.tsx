import type { CSSProperties, MouseEventHandler } from 'react';
import { Icon } from './Icon';

export interface CameraTriggerProps {
  size?: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
}

export function CameraTrigger({ size = 72, onClick, style }: CameraTriggerProps) {
  return (
    <button
      type="button"
      aria-label="Tomar foto"
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        border: '4px solid var(--mecanu-neutral-0)',
        background: 'var(--mecanu-brand-primary-dark)',
        color: 'var(--mecanu-text-primary-light)',
        boxShadow: 'var(--mecanu-shadow-deep)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <Icon name="photo_camera" size="xl" />
    </button>
  );
}
