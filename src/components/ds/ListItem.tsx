import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import styles from './ListItem.module.css';

export interface ListItemProps {
  title?: ReactNode;
  description?: ReactNode;
  leadingIcon?: string;
  leadingAvatar?: string;
  trailingText?: ReactNode;
  chevron?: boolean;
  badgeCount?: number | string;
  loading?: boolean;
  control?: ReactNode;
  divider?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  style?: CSSProperties;
}

export function ListItem({
  title,
  description,
  leadingIcon,
  leadingAvatar,
  trailingText,
  chevron = false,
  badgeCount,
  loading = false,
  control,
  divider = true,
  onClick,
  style,
}: ListItemProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`${styles.li} ${onClick ? styles.tappable : ''} ${divider ? styles.hasDivider : ''}`}
      style={style}
    >
      {leadingAvatar ? (
        <Avatar name={leadingAvatar} size={40} />
      ) : leadingIcon ? (
        <Icon name={leadingIcon} size="lg" color="var(--mecanu-text-secondary-light)" />
      ) : null}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontSize: 'var(--mecanu-font-size-h4)',
            lineHeight: 'var(--mecanu-line-height-h4)',
            fontWeight: 700,
            color: 'var(--mecanu-text-primary-light)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </span>
        {description ? (
          <span
            style={{
              display: 'block',
              fontSize: 'var(--mecanu-font-size-caption)',
              lineHeight: 'var(--mecanu-line-height-caption)',
              color: 'var(--mecanu-text-secondary-light)',
            }}
          >
            {description}
          </span>
        ) : null}
      </span>
      {trailingText ? (
        <span
          style={{
            fontSize: 'var(--mecanu-font-size-h5)',
            lineHeight: 'var(--mecanu-line-height-h5)',
            color: 'var(--mecanu-text-secondary-light)',
            flex: 'none',
          }}
        >
          {trailingText}
        </span>
      ) : null}
      {badgeCount != null ? (
        <span
          style={{
            minWidth: 20,
            height: 20,
            borderRadius: 999,
            background: 'var(--mecanu-warning)',
            color: 'var(--mecanu-neutral-0)',
            fontSize: 'var(--mecanu-font-size-caption)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 6px',
            flex: 'none',
          }}
        >
          {badgeCount}
        </span>
      ) : null}
      {loading ? <span className={styles.spin} aria-label="Cargando" /> : null}
      {control ? (
        <span
          style={{ flex: 'none', display: 'inline-flex' }}
          onClick={(e) => e.stopPropagation()}
        >
          {control}
        </span>
      ) : null}
      {chevron ? <Icon name="chevron_right" size="md" color="var(--mecanu-text-secondary-light)" /> : null}
    </Tag>
  );
}
