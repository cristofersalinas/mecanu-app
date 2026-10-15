import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneShell } from '../components/SceneShell';
import { VisualTitle } from '../components/VisualTitle';
import { colors } from '../lib/theme';
import { springIn } from '../lib/animations';
import { ChannelNotice } from '../components/ChannelNotice';

const BEATS = [
  {
    n: '01',
    title: 'El taller detecta la ITV',
    body: 'Mientras reparan el coche, ven que la ITV está caducada o a punto de caducar.',
  },
  {
    n: '02',
    title: 'Llaman a Mecanu',
    body: 'Con permiso del cliente, el taller gestiona la cita y pide el traslado ida y vuelta a la estación.',
  },
  {
    n: '03',
    title: 'El cliente se sorprende',
    body: 'Fue a por el coche al mecánico… y además le resolvieron la ITV. Sin perder la mañana en la cola.',
  },
];

export const ITV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneShell>
      <AbsoluteFill style={{ padding: '80px 64px 48px' }}>
        <div style={{ display: 'flex', gap: 48, height: '100%' }}>
          <div style={{ flex: 1 }}>
            <VisualTitle
              kicker="07 · ITV"
              title="ITV sin que el cliente pierda la mañana"
              subtitle="El taller se encarga del trámite. Mecanu hace el traslado. La inspección la hace la estación — nosotros movemos el coche."
            />
            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {BEATS.map((b, i) => {
                const enter = springIn(frame, fps, 24 + i * 18);
                return (
                  <div
                    key={b.n}
                    style={{
                      opacity: enter,
                      transform: `translateX(${interpolate(enter, [0, 1], [-20, 0])}px)`,
                      display: 'flex',
                      gap: 18,
                      padding: '18px 20px',
                      borderRadius: 16,
                      background: colors.neutral0,
                      border: `1px solid ${colors.neutral200}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: colors.electric600,
                        width: 48,
                        flex: 'none',
                      }}
                    >
                      {b.n}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{b.title}</div>
                      <div style={{ fontSize: 15, color: colors.neutral700, marginTop: 4, lineHeight: 1.4 }}>
                        {b.body}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              width: 520,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              opacity: springIn(frame, fps, 16),
            }}
          >
            <div
              style={{
                flex: 1,
                borderRadius: 20,
                overflow: 'hidden',
                border: `1px solid ${colors.neutral200}`,
                background: colors.emerald800,
                position: 'relative',
                minHeight: 420,
              }}
            >
              {/* Usamos icono de marca como ancla visual si no hay foto ITV local en remotion/public */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `
                    radial-gradient(circle at 30% 20%, ${colors.electric600}55, transparent 50%),
                    linear-gradient(160deg, ${colors.emerald800}, ${colors.neutral900})
                  `,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: 28,
                  color: colors.neutral0,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    color: colors.electric300,
                    marginBottom: 8,
                  }}
                >
                  CASO TALLER
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                  «Te lo arreglamos… y de paso te pasamos la ITV.»
                </div>
                <div style={{ marginTop: 12, fontSize: 15, color: colors.neutral300, lineHeight: 1.4 }}>
                  El cliente no espera en la estación. El taller retiene la revisión. Mecanu mueve el coche.
                </div>
              </div>
            </div>
            <div
              style={{
                background: colors.neutral0,
                border: `1px solid ${colors.neutral200}`,
                borderRadius: 14,
                padding: 16,
                fontSize: 14,
                color: colors.neutral700,
                lineHeight: 1.4,
              }}
            >
              Importante: Mecanu no pasa la ITV. Lleva el coche, espera o lo deja según el acuerdo, y lo devuelve.
            </div>
          </div>
        </div>

        {frame > 200 ? (
          <ChannelNotice
            channel="whatsapp"
            from="Taller Sol → Cliente"
            preview="Con tu permiso, llevamos el coche a la ITV mientras terminamos la reparación."
            delay={0}
            x={64}
            y={780}
          />
        ) : null}
      </AbsoluteFill>
    </SceneShell>
  );
};
