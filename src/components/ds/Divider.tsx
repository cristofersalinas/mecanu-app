import type { CSSProperties } from 'react';

export interface DividerProps {
  vertical?: boolean;
  spacing?: string;
  style?: CSSProperties;
}

export function Divider({ vertical = false, spacing = 'var(--mecanu-space-4)', style }: DividerProps) {
  if (vertical) {
    return (
      <span
        style={{
          display: 'inline-block',
          width: 1,
          alignSelf: 'stretch',
          background: 'var(--mecanu-border-subtle)',
          margin: `0 ${spacing}`,
          ...style,
        }}
      />
    );
  }
  return (
    <hr
      style={{
        border: 'none',
        borderTop: '1px solid var(--mecanu-border-subtle)',
        margin: `${spacing} 0`,
        ...style,
      }}
    />
  );
}
