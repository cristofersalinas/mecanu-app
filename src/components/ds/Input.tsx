import type { CSSProperties, ChangeEventHandler } from 'react';
import { Icon } from './Icon';
import styles from './Input.module.css';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'date' | 'time';

export interface InputProps {
  label?: string;
  caption?: string;
  error?: string;
  icon?: string;
  placeholder?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: InputType;
  style?: CSSProperties;
}

export function Input({
  label,
  caption,
  error,
  icon,
  placeholder,
  value,
  onChange,
  disabled,
  fullWidth,
  type = 'text',
  style,
}: InputProps) {
  return (
    <label className={fullWidth ? styles.fullWidth : styles.wrap} style={style}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <span
        className={`${styles.field} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
        style={{ width: fullWidth ? '100%' : undefined }}
      >
        {icon ? <Icon name={icon} size="sm" color="var(--mecanu-text-secondary-light)" /> : null}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      </span>
      {caption || error ? (
        <span className={`${styles.caption} ${error ? styles.captionError : ''}`}>{error || caption}</span>
      ) : null}
    </label>
  );
}
