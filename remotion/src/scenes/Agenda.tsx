import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneShell } from '../components/SceneShell';
import { VisualTitle } from '../components/VisualTitle';
import { AGENDA_ITEMS } from '../lib/timing';
import { colors } from '../lib/theme';
import { springIn } from '../lib/animations';

export const Agenda: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneShell>
      <AbsoluteFill style={{ padding: '100px 72px 64px' }}>
        <VisualTitle
          kicker="Apéndice"
          title="Qué vas a ver en este lanzamiento"
          subtitle="Ocho bloques. Avanzamos uno a uno — del tablero del taller al cierre por WhatsApp."
        />
        <div
          style={{
            marginTop: 48,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
            maxWidth: 1200,
          }}
        >
          {AGENDA_ITEMS.map((item, i) => {
            const enter = springIn(frame, fps, 20 + i * 10);
            const y = interpolate(enter, [0, 1], [24, 0]);
            const active = frame > 40 + i * 12 && frame < 55 + i * 12;
            return (
              <div
                key={item.n}
                style={{
                  opacity: enter,
                  transform: `translateY(${y}px)`,
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  padding: '16px 18px',
                  borderRadius: 14,
                  background: active ? colors.electric100 : colors.neutral0,
                  border: `1px solid ${active ? colors.electric600 : colors.neutral200}`,
                  boxShadow: active ? `0 0 0 2px ${colors.electric100}` : 'none',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: colors.emerald800,
                    color: colors.electric300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 16,
                    flex: 'none',
                  }}
                >
                  {item.n}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: colors.neutral600, marginTop: 2 }}>
                    {item.hint}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
