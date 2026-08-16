import type { CSSProperties } from 'react';

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
  square?: boolean;
  style?: CSSProperties;
}

export function Avatar({ name = '', src, size = 40, square = false, style }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
  const radius = square ? 'var(--mecanu-radius-200)' : 'var(--mecanu-radius-full)';
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'var(--mecanu-bg-tertiary-light)',
        color: 'var(--mecanu-text-secondary-light)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--mecanu-font-family)',
        fontWeight: 700,
        fontSize: size * 0.375,
        overflow: 'hidden',
        flex: 'none',
        ...style,
      }}
      aria-label={name}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials
      )}
    </span>
  );
}
