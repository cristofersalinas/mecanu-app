import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './FilterChip.module.css';

export interface FilterChipProps {
  label?: ReactNode;
  selected?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
}

export function FilterChip({ label, selected = false, onClick, style }: FilterChipProps) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
      onClick={onClick}
      style={style}
    >
      {label}
      <Icon name="keyboard_arrow_down" size="sm" />
    </button>
  );
}
