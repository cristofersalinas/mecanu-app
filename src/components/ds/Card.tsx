import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps {
  label?: ReactNode;
  value?: ReactNode;
  dark?: boolean;
  trailing?: ReactNode;
  trailingCaption?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Card({ label, value, dark = false, trailing, trailingCaption, onClick, children, style }: CardProps) {
  return (
    <div
      className={`${styles.card} ${dark ? styles.dark : styles.light} ${onClick ? styles.tappable : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={style}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        {label ? (
          <div
            style={{
              fontSize: 'var(--mecanu-font-size-h5)',
              lineHeight: 'var(--mecanu-line-height-h5)',
              color: dark ? 'var(--mecanu-text-secondary-dark)' : 'var(--mecanu-text-secondary-light)',
              marginBottom: 4,
            }}
          >
            {label}
          </div>
        ) : null}
        {value != null ? (
          <div
            style={{
              fontSize: 'var(--mecanu-font-size-h2)',
              lineHeight: 'var(--mecanu-line-height-h2)',
              fontWeight: 700,
            }}
          >
            {value}
          </div>
        ) : null}
        {children}
      </div>
      {trailing || trailingCaption ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
            flex: 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {trailing}
          {trailingCaption ? (
            <span
              style={{
                fontSize: 'var(--mecanu-font-size-caption)',
                lineHeight: 'var(--mecanu-line-height-caption)',
                color: dark ? 'var(--mecanu-text-secondary-dark)' : 'var(--mecanu-text-secondary-light)',
              }}
            >
              {trailingCaption}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
