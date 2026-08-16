import type { CSSProperties, ReactNode } from 'react';
import styles from './Radio.module.css';

export interface RadioProps {
  checked?: boolean;
  onChange?: (value: string | undefined) => void;
  name?: string;
  value?: string;
  disabled?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Radio({ checked, onChange, name, value, children, disabled, style }: RadioProps) {
  return (
    <label className={`${styles.radio} ${disabled ? styles.disabled : ''}`} style={style}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange?.(value)}
      />
      <span className={styles.dot} />
      {children ? <span>{children}</span> : null}
    </label>
  );
}
