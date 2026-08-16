import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { Button } from './Button';
import type { ButtonKind } from './Button';

export interface OversizedButtonProps {
  anchored?: boolean;
  kind?: ButtonKind;
  icon?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
  style?: CSSProperties;
}

export function OversizedButton({ anchored = false, children, style, ...rest }: OversizedButtonProps) {
  return (
    <Button
      size="large"
      fullWidth
      {...rest}
      style={{
        minHeight: 56,
        borderRadius: anchored ? 'var(--mecanu-radius-300) var(--mecanu-radius-300) 0 0' : 'var(--mecanu-radius-300)',
        fontSize: 16,
        ...style,
      }}
    >
      {children}
    </Button>
  );
}
