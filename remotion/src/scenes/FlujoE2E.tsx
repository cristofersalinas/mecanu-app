import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneShell } from '../components/SceneShell';
import { VisualTitle } from '../components/VisualTitle';
import { PanelKanban } from '../mockups/PanelKanban';
import { PhoneChrome, ConductorJornada } from '../mockups/ConductorPhone';
import { ChannelNotice } from '../components/ChannelNotice';
import { Cursor } from '../components/Cursor';
import { colors } from '../lib/theme';
import { cursorPath, springIn } from '../lib/animations';

const STEPS = [
  {
    n: '1',
    title: 'El cliente pide retiro a domicilio',
    body: 'No puede llevar el coche al taller. Pide que se lo recojan en casa o en el trabajo.',
  },
  {
    n: '2',
    title: 'El taller abre la ruta',
    body: 'Se crea la tarea en el panel: dirección, ventana de 1 h, seguro y conductor.',
  },
  {
    n: '3',
    title: 'El conductor hace el chequeo',
    body: 'Hasta 20 puntos visuales, fotos y firma. Solo entonces arranca el traslado.',
  },
  {
    n: '4',
    title: 'El viaje avanza con avisos',
    body: 'WhatsApp y correo informan: en camino, en taller, listo para devolver.',
  },
];

export const FlujoE2E: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const stepIdx = Math.min(
    STEPS.length - 1,
    Math.floor(interpolate(frame, [20, durationInFrames - 40], [0, STEPS.length - 0.01], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })),
  );
  const cursor = cursorPath(frame, [
    { f: 0, x: 1100, y: 700 },
    { f: 80, x: 900, y: 380 },
    { f: 160, x: 900, y: 380 },
    { f: 240, x: 1480, y: 420 },
    { f: 360, x: 1480, y: 420 },
    { f: 450, x: 1480, y: 520 },
  ]);

  const showPanel = stepIdx <= 1;
  const showPhone = stepIdx >= 2;
  const showWa1 = frame > 200;
  const showWa2 = frame > 380;
  const showMail = frame > 500;

  return (
    <SceneShell>
      <AbsoluteFill style={{ padding: '72px 48px 36px' }}>
        <VisualTitle
          kicker="04 · Flujo de punta a punta"
          title="Del “no puedo ir” al coche en el taller"
          subtitle="Así se usa la plataforma cuando el cliente necesita retiro a domicilio."
        />

        {/* Step rail */}
        <div
          style={{
            marginTop: 28,
            display: 'flex',
            gap: 10,
            maxWidth: 1600,
          }}
        >
          {STEPS.map((s, i) => {
            const on = i === stepIdx;
            const done = i < stepIdx;
            return (
              <div
                key={s.n}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: on ? colors.electric100 : colors.neutral0,
                  border: `1px solid ${on ? colors.electric600 : colors.neutral200}`,
                  opacity: on || done ? 1 : 0.55,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: on ? colors.electric600 : colors.neutral600,
                    letterSpacing: '0.08em',
                  }}
                >
                  PASO {s.n}
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, marginTop: 4 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: colors.neutral600, marginTop: 4, lineHeight: 1.35 }}>
                  {s.body}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 28,
            display: 'flex',
            gap: 32,
            alignItems: 'flex-start',
            position: 'relative',
            minHeight: 520,
          }}
        >
          {/* Cliente bubble */}
          <div
            style={{
              width: 280,
              opacity: springIn(frame, fps, 10),
              background: colors.neutral0,
              border: `1px solid ${colors.neutral200}`,
              borderRadius: 16,
              padding: 18,
              boxShadow: '0 12px 32px rgba(22,23,24,0.08)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: colors.electric600, letterSpacing: '0.1em' }}>
              CLIENTE
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, marginTop: 6 }}>Carlos Ruiz</div>
            <div style={{ fontSize: 14, color: colors.neutral700, marginTop: 8, lineHeight: 1.4 }}>
              «Necesito que me retiréis el Golf en Chamberí. No puedo pasar por el taller esta semana.»
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 12,
                color: colors.neutral600,
                paddingTop: 12,
                borderTop: `1px solid ${colors.neutral200}`,
              }}
            >
              Canal: WhatsApp al taller
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', minHeight: 480 }}>
            {showPanel ? (
              <div
                style={{
                  transform: 'scale(0.78)',
                  transformOrigin: 'top left',
                  opacity: interpolate(frame, [40, 70], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                }}
              >
                <PanelKanban width={1100} height={560} highlightCard={stepIdx === 1} />
              </div>
            ) : null}
            {showPhone ? (
              <div
                style={{
                  position: 'absolute',
                  right: 40,
                  top: 20,
                  opacity: springIn(frame, fps, 0),
                }}
              >
                <PhoneChrome width={300} height={600}>
                  <ConductorJornada
                    step={stepIdx >= 3 ? 'enruta' : 'chequeo'}
                    highlight
                  />
                </PhoneChrome>
              </div>
            ) : null}
            {stepIdx === 1 ? <Cursor x={cursor.x - 200} y={cursor.y - 80} clicking={frame > 140 && frame < 160} /> : null}
          </div>
        </div>

        {showWa1 ? (
          <ChannelNotice
            channel="whatsapp"
            from="Taller Sol"
            preview="Ruta TR-1108 creada. Recogida hoy 10:00–11:00 en Chamberí."
            delay={0}
            x={48}
            y={780}
          />
        ) : null}
        {showWa2 ? (
          <ChannelNotice
            channel="whatsapp"
            from="Mecanu Conductor"
            preview="Chequeo listo. Voy de camino con tu VW Golf."
            delay={0}
            x={460}
            y={780}
          />
        ) : null}
        {showMail ? (
          <ChannelNotice
            channel="email"
            from="avisos@mecanu.com"
            preview="Tu coche ya está en el taller. Te avisamos al cerrar la OR."
            delay={0}
            x={880}
            y={780}
          />
        ) : null}
      </AbsoluteFill>
    </SceneShell>
  );
};
