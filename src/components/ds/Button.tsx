import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './Button.module.css';

export type ButtonKind = 'primary' | 'secondary' | 'tertiary' | 'negative';
export type ButtonSize = 'compact' | 'default' | 'large';

export interface ButtonProps {
  kind?: ButtonKind;
  size?: ButtonSize;
  icon?: string;
  iconFilled?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit';
  children?: ReactNode;
  'aria-label'?: string;
  style?: CSSProperties;
}

const SIZES: Record<ButtonSize, { height: number; padding: string; fontSize: number }> = {
  compact: { height: 36, padding: '0 12px', fontSize: 14 },
  default: { height: 48, padding: '0 16px', fontSize: 16 },
  large: { height: 56, padding: '0 24px', fontSize: 16 },
};

const KIND_CLASS: Record<ButtonKind, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  tertiary: styles.tertiary,
  negative: styles.negative,
};

export function Button({
  kind = 'primary',
  size = 'default',
  icon,
  iconFilled,
  children,
  disabled,
  onClick,
  fullWidth,
  'aria-label': ariaLabel,
  style,
  type = 'button',
}: ButtonProps) {
  const s = SIZES[size] ?? SIZES.default;
  const iconOnly = Boolean(icon) && !children;
  return (
    <button
      type={type}
      className={`${styles.btn} ${KIND_CLASS[kind]}`}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        height: s.height,
        padding: iconOnly ? 0 : s.padding,
        width: iconOnly ? s.height : fullWidth ? '100%' : undefined,
        fontSize: s.fontSize,
        ...style,
      }}
    >
      {icon ? <Icon name={icon} size="md" filled={iconFilled} /> : null}
      {children}
    </button>
  );
}
