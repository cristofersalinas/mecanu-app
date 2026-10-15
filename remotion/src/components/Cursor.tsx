import React from 'react';
import { colors } from '../lib/theme';

export function Cursor({
  x,
  y,
  clicking = false,
  opacity = 1,
}: {
  x: number;
  y: number;
  clicking?: boolean;
  opacity?: number;
}) {
  const scale = clicking ? 0.88 : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-4px, -2px) scale(${scale})`,
        opacity,
        zIndex: 50,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M4.5 2.5L19.5 11.2L12.1 12.8L9.2 20.5L4.5 2.5Z"
          fill={colors.neutral900}
          stroke={colors.neutral0}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      {clicking ? (
        <div
          style={{
            position: 'absolute',
            left: -6,
            top: -6,
            width: 22,
            height: 22,
            borderRadius: 999,
            border: `2px solid ${colors.electric600}`,
            opacity: 0.55,
          }}
        />
      ) : null}
    </div>
  );
}
