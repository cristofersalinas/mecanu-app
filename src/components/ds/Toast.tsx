import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './Toast.module.css';

export type ToastKind = 'info' | 'positive' | 'warning' | 'alert';

export interface ToastProps {
  kind?: ToastKind;
  children?: ReactNode;
  onDismiss?: () => void;
  style?: CSSProperties;
}

const TOAST_ICONS: Record<ToastKind, string> = {
  info: 'info',
  positive: 'check_circle',
  warning: 'warning',
  alert: 'error',
};

const TOAST_COLORS: Record<ToastKind, string> = {
  info: 'var(--mecanu-info)',
  positive: 'var(--mecanu-positive)',
  warning: 'var(--mecanu-warning)',
  alert: 'var(--mecanu-alert)',
};

export function Toast({ kind = 'info', children, onDismiss, style }: ToastProps) {
  return (
    <div className={styles.toast} role="status" style={style}>
      <Icon name={TOAST_ICONS[kind]} size="md" color={TOAST_COLORS[kind]} style={{ marginTop: 1 }} />
      <span style={{ flex: 1 }}>{children}</span>
      {onDismiss ? (
        <button type="button" aria-label="Cerrar" onClick={onDismiss}>
          <Icon name="close" size="sm" />
        </button>
      ) : null}
    </div>
  );
}
