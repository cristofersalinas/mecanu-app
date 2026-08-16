import type { CSSProperties } from 'react';
import styles from './TireSelector.module.css';

export interface TireSelectorProps {
  options?: string[];
  value?: string;
  onChange?: (value: string) => void;
  style?: CSSProperties;
}

export function TireSelector({ options = ['Bueno', 'Regular', 'Vencido'], value, onChange, style }: TireSelectorProps) {
  return (
    <div className={styles.wrap} role="radiogroup" style={style}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={o === value}
          className={o === value ? styles.selected : ''}
          onClick={() => onChange?.(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
