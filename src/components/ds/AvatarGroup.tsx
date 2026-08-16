import type { CSSProperties } from 'react';
import { Avatar } from './Avatar';

export interface AvatarGroupProps {
  names?: string[];
  max?: number;
  size?: number;
  style?: CSSProperties;
}

export function AvatarGroup({ names = [], max = 4, size = 32, style }: AvatarGroupProps) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
      {shown.map((n, i) => (
        <Avatar
          key={n + i}
          name={n}
          size={size}
          style={{
            marginLeft: i === 0 ? 0 : -size * 0.25,
            border: '2px solid var(--mecanu-neutral-0)',
            boxSizing: 'content-box',
          }}
        />
      ))}
      {rest > 0 ? (
        <span
          style={{
            marginLeft: -size * 0.25,
            width: size,
            height: size,
            borderRadius: 999,
            background: 'var(--mecanu-neutral-900)',
            color: 'var(--mecanu-neutral-0)',
            border: '2px solid var(--mecanu-neutral-0)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--mecanu-font-family)',
            fontWeight: 700,
            fontSize: size * 0.34,
            boxSizing: 'content-box',
          }}
        >
          +{rest}
        </span>
      ) : null}
    </span>
  );
}
