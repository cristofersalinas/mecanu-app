import type { CSSProperties } from 'react';

export type IconSize = 'sm' | 'md' | 'lg' | 'xl';

export interface IconProps {
  name: string;
  size?: IconSize;
  filled?: boolean;
  color?: string;
  style?: CSSProperties;
}

const SIZE_VARS: Record<IconSize, string> = {
  sm: 'var(--mecanu-icon-sm)',
  md: 'var(--mecanu-icon-md)',
  lg: 'var(--mecanu-icon-lg)',
  xl: 'var(--mecanu-icon-xl)',
};

/** Renders a Material Symbols Rounded ligature. `name` is the icon's literal name, e.g. "search". */
export function Icon({ name, size = 'lg', filled = false, color, style }: IconProps) {
  return (
    <span
      className={'mecanu-icon' + (filled ? ' is-filled' : '')}
      aria-hidden="true"
      style={{
        fontSize: SIZE_VARS[size] ?? size,
        color,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
