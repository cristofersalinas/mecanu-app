import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './Tag.module.css';

export interface TagProps {
  children?: ReactNode;
  onClose?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
}

export function Tag({ children, onClose, style }: TagProps) {
  return (
    <span className={styles.tag} style={style}>
      {children}
      {onClose ? (
        <button type="button" aria-label="Quitar" onClick={onClose}>
          <Icon name="close" size="sm" />
        </button>
      ) : null}
    </span>
  );
}
