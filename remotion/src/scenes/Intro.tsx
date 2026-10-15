import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneShell } from '../components/SceneShell';
import { LogoWordmark } from '../components/LogoWordmark';
import { VolanteTint } from '../components/VolanteMark';
import { colors } from '../lib/theme';
import { springIn } from '../lib/animations';

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = springIn(frame, fps, 8);
  const sub = springIn(frame, fps, 28);
  const volanteSpin = interpolate(frame, [0, 90], [0, 18], {
    extrapolateRight: 'clamp',
  });

  return (
    <SceneShell showBrand={false} dark>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        <div
          style={{
            transform: `scale(${interpolate(logo, [0, 1], [0.7, 1])}) rotate(${volanteSpin}deg)`,
            opacity: logo,
          }}
        >
          <VolanteTint size={120} color={colors.electric300} />
        </div>
        <div style={{ opacity: logo, transform: `translateY(${interpolate(logo, [0, 1], [20, 0])}px)` }}>
          <LogoWordmark height={64} color={colors.neutral0} />
        </div>
        <div
          style={{
            opacity: sub,
            transform: `translateY(${interpolate(sub, [0, 1], [16, 0])}px)`,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: colors.electric300,
              marginBottom: 10,
            }}
          >
            Lanzamiento de producto
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: colors.neutral300,
              maxWidth: 720,
              lineHeight: 1.35,
            }}
          >
            La capa de logística del taller: panel, conductor y cliente en un solo flujo.
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
