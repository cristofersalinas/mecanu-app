'use client';

import { useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import styles from './Modal.module.css';

export interface ModalProps {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  primaryAction?: ReactNode;
  onPrimary?: () => void;
  secondaryAction?: ReactNode;
  style?: CSSProperties;
}

export function Modal({
  open,
  title,
  children,
  onClose,
  primaryAction,
  onPrimary,
  secondaryAction = 'Cancelar',
  style,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined} style={style}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--mecanu-space-4) var(--mecanu-space-6)',
            borderBottom: '1px solid var(--mecanu-border-subtle)',
          }}
        >
          <span style={{ fontSize: 'var(--mecanu-font-size-h3)', lineHeight: 'var(--mecanu-line-height-h3)', fontWeight: 700 }}>{title}</span>
          <button type="button" className={styles.closeBtn} aria-label="Cerrar" onClick={onClose}>
            <Icon name="close" size="md" />
          </button>
        </div>
        <div style={{ padding: 'var(--mecanu-space-4) var(--mecanu-space-6)', overflow: 'auto', flex: 1 }}>{children}</div>
        {primaryAction ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--mecanu-space-2)',
              padding: 'var(--mecanu-space-4) var(--mecanu-space-6)',
              borderTop: '1px solid var(--mecanu-border-subtle)',
            }}
          >
            <Button kind="tertiary" onClick={onClose}>
              {secondaryAction}
            </Button>
            <Button onClick={onPrimary}>{primaryAction}</Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
