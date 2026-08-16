import type { CSSProperties, ReactNode } from 'react';
import styles from './BottomSheet.module.css';

export interface BottomSheetProps {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

export function BottomSheet({ open = true, title, children, style }: BottomSheetProps) {
  if (!open) return null;
  return (
    <div className={styles.sheet} style={style}>
      <div className={styles.handle} />
      {title ? <div className={styles.title}>{title}</div> : null}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
