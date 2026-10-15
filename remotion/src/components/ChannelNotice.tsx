import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors } from '../lib/theme';
import { springIn } from '../lib/animations';

/** Notificación de canal (WhatsApp / correo), no popup de UI. */
export function ChannelNotice({
  channel,
  from,
  preview,
  delay = 0,
  x = 48,
  y = 120,
}: {
  channel: 'whatsapp' | 'email';
  from: string;
  preview: string;
  delay?: number;
  x?: number;
  y?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = springIn(frame, fps, delay);
  const ty = interpolate(enter, [0, 1], [40, 0]);
  const op = interpolate(enter, [0, 1], [0, 1]);
  const isWa = channel === 'whatsapp';

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 380,
        transform: `translateY(${ty}px)`,
        opacity: op,
        background: colors.neutral0,
        border: `1px solid ${colors.neutral200}`,
        borderRadius: 16,
        padding: '14px 16px',
        boxShadow: '0 12px 32px rgba(22,23,24,0.12)',
        display: 'flex',
        gap: 12,
        zIndex: 40,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          flex: 'none',
          background: isWa ? colors.waGreen : colors.info,
          color: colors.neutral0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: 13,
        }}
      >
        {isWa ? 'WA' : '@'}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: colors.neutral600,
            marginBottom: 2,
          }}
        >
          {isWa ? 'WhatsApp' : 'Correo'}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: colors.neutral900 }}>
          {from}
        </div>
        <div
          style={{
            fontSize: 14,
            color: colors.neutral700,
            marginTop: 2,
            lineHeight: 1.35,
          }}
        >
          {preview}
        </div>
      </div>
    </div>
  );
}
