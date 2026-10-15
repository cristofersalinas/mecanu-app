import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneShell } from '../components/SceneShell';
import { LogoWordmark } from '../components/LogoWordmark';
import { VolanteTint } from '../components/VolanteMark';
import { colors } from '../lib/theme';
import { springIn } from '../lib/animations';

export const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = springIn(frame, fps, 6);
  const b = springIn(frame, fps, 22);
  const c = springIn(frame, fps, 40);

  return (
    <SceneShell showBrand={false} dark>
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            opacity: a,
            transform: `scale(${interpolate(a, [0, 1], [0.8, 1])})`,
          }}
        >
          <VolanteTint size={96} color={colors.electric300} />
        </div>
        <div style={{ opacity: a }}>
          <LogoWordmark height={56} color={colors.neutral0} />
        </div>
        <div
          style={{
            opacity: b,
            transform: `translateY(${interpolate(b, [0, 1], [16, 0])}px)`,
            textAlign: 'center',
            maxWidth: 820,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              lineHeight: 1.3,
              color: colors.neutral0,
              letterSpacing: '-0.02em',
            }}
          >
            Recoge. Repara. Devuelve.
            <br />
            El cliente no tiene que ir.
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 18,
              color: colors.neutral300,
              lineHeight: 1.45,
            }}
          >
            Panel del taller · app del conductor · alertas · WhatsApp · ITV
          </div>
        </div>
        <div
          style={{
            marginTop: 12,
            opacity: c,
            background: colors.electric300,
            color: colors.neutral900,
            fontWeight: 800,
            fontSize: 16,
            padding: '14px 28px',
            borderRadius: 12,
          }}
        >
          mecanu.com
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
