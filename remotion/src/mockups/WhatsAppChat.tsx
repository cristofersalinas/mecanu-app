import React from 'react';
import { colors } from '../lib/theme';

type Msg = { from: 'agent' | 'client'; text: string };

export function WhatsAppChat({
  messages,
  width = 360,
  height = 520,
}: {
  messages: Msg[];
  width?: number;
  height?: number;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${colors.neutral200}`,
        boxShadow: '0 20px 48px rgba(22,23,24,0.14)',
        display: 'flex',
        flexDirection: 'column',
        background: '#E5DDD5',
      }}
    >
      <div
        style={{
          background: '#075E54',
          color: colors.neutral0,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: colors.electric600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          M
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Mecanu · Taller Sol</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>Agente · en línea</div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          overflow: 'hidden',
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.from === 'agent' ? 'flex-start' : 'flex-end',
              maxWidth: '82%',
              background: m.from === 'agent' ? colors.waBubbleIn : colors.waBubbleOut,
              borderRadius: 12,
              padding: '9px 11px',
              fontSize: 13,
              lineHeight: 1.4,
              color: colors.neutral900,
              boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
            }}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div
        style={{
          background: '#F0F0F0',
          padding: 10,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            flex: 1,
            background: colors.neutral0,
            borderRadius: 999,
            padding: '10px 14px',
            fontSize: 12,
            color: colors.neutral500,
          }}
        >
          Escribe un mensaje
        </div>
      </div>
    </div>
  );
}
