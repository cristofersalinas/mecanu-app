'use client';

import type { ReactNode } from 'react';
import { Icon } from '@/components/ds/Icon';
import styles from '../panel.module.css';

export function DashboardWidgetShell({
  titulo,
  icon,
  editing,
  onRemove,
  headerRight,
  children,
  className,
  style,
}: {
  titulo?: string;
  icon?: string;
  editing?: boolean;
  onRemove?: () => void;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** @deprecated El cuerpo siempre llena la altura; se ignora. */
  fill?: boolean;
}) {
  return (
    <section
      className={`${styles.panelBox} ${styles.dashWidget}${editing ? ` ${styles.dashWidgetEdit}` : ''}${className ? ` ${className}` : ''}`}
      style={{
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(titulo || editing || headerRight) ? (
        <div className={styles.dashWidgetHeader}>
          {editing ? (
            <span className={styles.dashDragHandle} data-dash-drag title="Arrastrar">
              <Icon name="drag_indicator" size="sm" />
            </span>
          ) : null}
          {icon ? (
            <span className={styles.dashWidgetIcon}>
              <Icon name={icon} size="sm" />
            </span>
          ) : null}
          {titulo ? <span className={styles.dashWidgetTitle}>{titulo}</span> : <span style={{ flex: 1 }} />}
          <div style={{ flex: 1 }} />
          {headerRight}
          {editing && onRemove ? (
            <button
              type="button"
              className={styles.ghostBtn}
              style={{ padding: 4, display: 'inline-flex' }}
              aria-label="Quitar widget"
              onClick={onRemove}
            >
              <Icon name="close" size="sm" />
            </button>
          ) : null}
        </div>
      ) : null}
      <div className={styles.dashWidgetBody}>
        {children}
      </div>
      {editing ? <span className={styles.dashResizeHandle} data-dash-resize title="Redimensionar" /> : null}
    </section>
  );
}
