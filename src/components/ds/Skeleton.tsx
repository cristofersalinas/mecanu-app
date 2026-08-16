import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  style?: CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, circle = false, style }: SkeletonProps) {
  return (
    <span
      className={styles.skeleton}
      style={{
        width,
        height,
        borderRadius: circle ? '999px' : undefined,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
