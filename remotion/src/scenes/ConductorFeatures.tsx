import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneShell } from '../components/SceneShell';
import { VisualTitle } from '../components/VisualTitle';
import { PhoneChrome, ConductorJornada } from '../mockups/ConductorPhone';
import { colors } from '../lib/theme';
import { springIn } from '../lib/animations';

const FEATURES = [
  { t: 'Jornada offline-first', d: 'Si no hay red, la tarea se encola y se reintenta igual.' },
  { t: 'Chequeo de 20 puntos', d: 'Fotos, testigos y firma antes de mover el coche.' },
  { t: 'Ventana de 1 hora', d: 'Nunca hora exacta: el cliente ve el rango comprometido.' },
  { t: 'Cobertura RC visible', d: 'En cada card, sin letras pequeñas escondidas.' },
];

export const ConductorFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phoneA = springIn(frame, fps, 10);
  const phoneB = springIn(frame, fps, 28);
  const step = frame > 180 ? 'chequeo' : frame > 90 ? 'enruta' : 'lista';

  return (
    <SceneShell>
      <AbsoluteFill style={{ padding: '88px 64px 48px' }}>
        <div style={{ display: 'flex', gap: 56, height: '100%', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              gap: 28,
              opacity: phoneA,
              transform: `translateY(${interpolate(phoneA, [0, 1], [36, 0])}px)`,
            }}
          >
            <PhoneChrome>
              <ConductorJornada highlight step={step === 'chequeo' ? 'lista' : step} />
            </PhoneChrome>
            <div
              style={{
                opacity: phoneB,
                transform: `translateY(${interpolate(phoneB, [0, 1], [48, 12])}px)`,
              }}
            >
              <PhoneChrome>
                <ConductorJornada step={step === 'chequeo' ? 'chequeo' : 'lista'} />
              </PhoneChrome>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <VisualTitle
              kicker="02 · App del conductor"
              title="El móvil que ejecuta el traslado"
              subtitle="Diseñada para la calle: botones grandes, evidencia y estados que solo mueve el conductor."
            />
            <div
              style={{
                marginTop: 36,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
              }}
            >
              {FEATURES.map((f, i) => {
                const enter = springIn(frame, fps, 36 + i * 12);
                return (
                  <div
                    key={f.t}
                    style={{
                      opacity: enter,
                      transform: `translateY(${interpolate(enter, [0, 1], [18, 0])}px)`,
                      background: colors.neutral0,
                      border: `1px solid ${colors.neutral200}`,
                      borderRadius: 14,
                      padding: 18,
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{f.t}</div>
                    <div style={{ marginTop: 6, fontSize: 14, color: colors.neutral600, lineHeight: 1.4 }}>
                      {f.d}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
