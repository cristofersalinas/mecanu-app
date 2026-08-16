import type { CSSProperties } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import styles from './UpsellAlertCard.module.css';

export interface UpsellAlertCardProps {
  title?: string;
  detail?: string;
  thumbnailSrc?: string;
  isNew?: boolean;
  cta?: string;
  onCta?: () => void;
  style?: CSSProperties;
}

export function UpsellAlertCard({
  title,
  detail,
  thumbnailSrc,
  isNew = false,
  cta = 'Ver cotización',
  onCta,
  style,
}: UpsellAlertCardProps) {
  return (
    <div className={`${styles.card} ${isNew ? styles.isNew : ''}`} style={style}>
      <Icon name="warning" size="lg" color="var(--mecanu-warning)" />
      {thumbnailSrc ? (
        <img
          src={thumbnailSrc}
          alt=""
          style={{ width: 56, height: 56, borderRadius: 'var(--mecanu-radius-200)', objectFit: 'cover', flex: 'none' }}
        />
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontWeight: 700, fontSize: 'var(--mecanu-font-size-h5)', lineHeight: 'var(--mecanu-line-height-h5)' }}>
          {isNew ? (
            <span className={styles.dot} style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--mecanu-warning)', flex: 'none', marginTop: 6 }} />
          ) : null}
          {title}
        </div>
        <div style={{ fontSize: 'var(--mecanu-font-size-caption)', lineHeight: 'var(--mecanu-line-height-caption)', color: 'var(--mecanu-text-secondary-light)', margin: '2px 0 10px' }}>
          {detail}
        </div>
        <Button size="compact" kind="secondary" onClick={onCta}>
          {cta}
        </Button>
      </div>
    </div>
  );
}
