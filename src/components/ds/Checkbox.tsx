import type { CSSProperties, ReactNode } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Checkbox({ checked, onChange, children, disabled, style }: CheckboxProps) {
  return (
    <label className={`${styles.check} ${disabled ? styles.disabled : ''}`} style={style}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className={styles.box} />
      {children ? <span>{children}</span> : null}
    </label>
  );
}
