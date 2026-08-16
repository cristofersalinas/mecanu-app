import type { CSSProperties, ReactNode } from 'react';
import styles from './Switch.module.css';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Switch({ checked, onChange, children, disabled, style }: SwitchProps) {
  return (
    <label className={`${styles.switch} ${disabled ? styles.disabled : ''}`} style={style}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className={styles.track} />
      {children ? <span>{children}</span> : null}
    </label>
  );
}
