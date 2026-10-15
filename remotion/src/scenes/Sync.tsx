import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneShell } from '../components/SceneShell';
import { VisualTitle } from '../components/VisualTitle';
import { PanelKanban } from '../mockups/PanelKanban';
import { PhoneChrome, ConductorJornada } from '../mockups/ConductorPhone';
import { colors } from '../lib/theme';
import { springIn } from '../lib/animations';
import { ChannelNotice } from '../components/ChannelNotice';

export const Sync: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = 0.5 + 0.5 * Math.sin(frame / 8);
  const enter = springIn(frame, fps, 8);

  return (
    <SceneShell>
      <AbsoluteFill style={{ padding: '80px 56px 40px' }}>
        <VisualTitle
          kicker="03 · Sincronización"
          title="Una acción en el móvil. El tablero se entera."
          subtitle="El estado vive en la ruta. El conductor mueve los subestados de En ruta; el taller los ve al momento."
        />
        <div
          style={{
            marginTop: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            opacity: enter,
          }}
        >
          <div style={{ transform: 'scale(0.72)', transformOrigin: 'center right' }}>
            <PanelKanban width={980} height={540} highlightCard />
          </div>

          {/* Bridge */}
          <div
            style={{
              width: 160,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 999,
                background: colors.emerald800,
                color: colors.electric300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                boxShadow: `0 0 0 ${8 + pulse * 10}px rgba(120,250,174,${0.12 + pulse * 0.1})`,
              }}
            >
              SYNC
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                textAlign: 'center',
                color: colors.neutral700,
                lineHeight: 1.35,
              }}
            >
              Evento
              <br />
              <span style={{ color: colors.electric600 }}>conductor → panel</span>
            </div>
            <div
              style={{
                width: 2,
                height: 48,
                background: `linear-gradient(${colors.electric600}, transparent)`,
                opacity: interpolate(frame, [20, 80], [0.3, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            />
          </div>

          <div style={{ transform: 'scale(0.95)' }}>
            <PhoneChrome width={280} height={560}>
              <ConductorJornada step="enruta" highlight />
            </PhoneChrome>
          </div>
        </div>

        {frame > 120 ? (
          <ChannelNotice
            channel="whatsapp"
            from="Mecanu"
            preview="Tu coche ya va en camino. Ventana 10:00–11:00."
            delay={0}
            x={56}
            y={760}
          />
        ) : null}
      </AbsoluteFill>
    </SceneShell>
  );
};
