import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { colors } from '../lib/theme';
import { springIn } from '../lib/animations';

export function VisualTitle({
  kicker,
  title,
  subtitle,
  delay = 0,
  dark = false,
  align = 'left',
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  delay?: number;
  dark?: boolean;
  align?: 'left' | 'center';
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = springIn(frame, fps, delay);
  const y = interpolate(enter, [0, 1], [28, 0]);
  const op = interpolate(enter, [0, 1], [0, 1]);

  return (
    <div
      style={{
        textAlign: align,
        transform: `translateY(${y}px)`,
        opacity: op,
        maxWidth: 920,
      }}
    >
      {kicker ? (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: dark ? colors.electric300 : colors.electric600,
              boxShadow: `0 0 0 6px ${dark ? 'rgba(120,250,174,0.15)' : 'rgba(65,148,104,0.15)'}`,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: dark ? colors.electric300 : colors.electric600,
            }}
          >
            {kicker}
          </span>
        </div>
      ) : null}
      <h1
        style={{
          margin: 0,
          fontSize: 56,
          lineHeight: 1.08,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: dark ? colors.neutral0 : colors.neutral900,
        }}
      >
        {title}
      </h1>
      {subtitle ? (
        <p
          style={{
            margin: '16px 0 0',
            fontSize: 22,
            lineHeight: 1.45,
            fontWeight: 500,
            color: dark ? colors.neutral300 : colors.neutral700,
            maxWidth: 720,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
