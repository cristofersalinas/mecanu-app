import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors } from '../lib/theme';
import { fontFamily } from './Font';
import { fadeIn, fadeOut } from '../lib/animations';
import { LogoWordmark } from './LogoWordmark';
import { VolanteTint } from './VolanteMark';

export function SceneShell({
  children,
  dark = false,
  showBrand = true,
  fadeOutAt,
}: {
  children: React.ReactNode;
  dark?: boolean;
  showBrand?: boolean;
  fadeOutAt?: number;
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const outStart = fadeOutAt ?? durationInFrames - 12;
  const opacity = Math.min(fadeIn(frame, 0, 14), fadeOut(frame, outStart, 12));

  return (
    <AbsoluteFill
      style={{
        background: dark
          ? `radial-gradient(1200px 700px at 20% 0%, ${colors.emerald800} 0%, ${colors.neutral900} 55%, #0a0a0b 100%)`
          : `radial-gradient(1400px 800px at 80% -10%, ${colors.electric100} 0%, ${colors.neutral25} 42%, ${colors.neutral0} 100%)`,
        fontFamily,
        color: dark ? colors.neutral0 : colors.neutral900,
        opacity,
      }}
    >
      {/* Atmósfera: malla suave */}
      <AbsoluteFill
        style={{
          opacity: dark ? 0.12 : 0.35,
          backgroundImage: `
            linear-gradient(${dark ? 'rgba(120,250,174,0.08)' : 'rgba(65,148,104,0.06)'} 1px, transparent 1px),
            linear-gradient(90deg, ${dark ? 'rgba(120,250,174,0.08)' : 'rgba(65,148,104,0.06)'} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        }}
      />
      {showBrand ? (
        <div
          style={{
            position: 'absolute',
            top: 36,
            left: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            zIndex: 5,
          }}
        >
          <VolanteTint size={28} color={dark ? colors.electric300 : colors.electric600} />
          <LogoWordmark height={22} color={dark ? colors.neutral0 : colors.neutral900} />
        </div>
      ) : null}
      {children}
    </AbsoluteFill>
  );
}
