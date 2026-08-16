import type { CSSProperties } from 'react';
import { Icon } from './Icon';
import styles from './Attachment.module.css';

export type AttachmentType = 'image' | 'pdf' | 'doc';
export type AttachmentStatus = 'uploading' | 'done' | 'error';

export interface AttachmentProps {
  name?: string;
  meta?: string;
  type?: AttachmentType;
  status?: AttachmentStatus;
  progress?: number;
  onRemove?: () => void;
  onRetry?: () => void;
  style?: CSSProperties;
}

const A_ICONS: Record<AttachmentType, string> = {
  image: 'image',
  pdf: 'picture_as_pdf',
  doc: 'description',
};

export function Attachment({ name, meta, type = 'doc', status = 'done', progress, onRemove, onRetry, style }: AttachmentProps) {
  return (
    <div className={`${styles.attach} ${status === 'error' ? styles.error : ''}`} style={style}>
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--mecanu-radius-100)',
          background: 'var(--mecanu-bg-secondary-light)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        <Icon name={A_ICONS[type] || type} size="md" color="var(--mecanu-text-secondary-light)" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontSize: 'var(--mecanu-font-size-h5)',
            lineHeight: 'var(--mecanu-line-height-h5)',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
        <span
          style={{
            display: 'block',
            fontSize: 'var(--mecanu-font-size-caption)',
            lineHeight: 'var(--mecanu-line-height-caption)',
            color: status === 'error' ? 'var(--mecanu-alert)' : 'var(--mecanu-text-secondary-light)',
          }}
        >
          {status === 'uploading' ? `Subiendo… ${progress != null ? progress + '%' : ''}` : status === 'error' ? 'Falló la subida' : meta}
        </span>
        {status === 'uploading' ? (
          <span style={{ display: 'block', height: 4, borderRadius: 999, background: 'var(--mecanu-bg-tertiary-light)', marginTop: 6, overflow: 'hidden' }}>
            <span
              style={{
                display: 'block',
                height: '100%',
                width: (progress || 0) + '%',
                background: 'var(--mecanu-brand-primary-light)',
                borderRadius: 999,
                transition: 'width 200ms var(--mecanu-ease-linear)',
              }}
            />
          </span>
        ) : null}
      </span>
      {status === 'uploading' ? <span className={styles.spin} /> : null}
      {status === 'done' ? <Icon name="check_circle" size="md" filled color="var(--mecanu-positive)" /> : null}
      {status === 'error' && onRetry ? (
        <button type="button" className={styles.x} aria-label="Reintentar" onClick={onRetry}>
          <Icon name="replay" size="md" />
        </button>
      ) : null}
      {onRemove ? (
        <button type="button" className={styles.x} aria-label="Quitar" onClick={onRemove}>
          <Icon name="close" size="sm" />
        </button>
      ) : null}
    </div>
  );
}
