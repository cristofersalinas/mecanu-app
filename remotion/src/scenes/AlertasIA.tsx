import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneShell } from '../components/SceneShell';
import { VisualTitle } from '../components/VisualTitle';
import { PhoneChrome, ConductorJornada } from '../mockups/ConductorPhone';
import { WhatsAppChat } from '../mockups/WhatsAppChat';
import { ChannelNotice } from '../components/ChannelNotice';
import { colors } from '../lib/theme';
import { springIn } from '../lib/animations';

const ALL_MSGS = [
  {
    from: 'agent' as const,
    text: 'Hola Carlos. En el chequeo del Golf vimos pastillas al límite y el testigo de servicio. ¿Te va bien revisar frenos la próxima semana?',
  },
  {
    from: 'client' as const,
    text: '¿Es urgente? Estoy liado esta semana…',
  },
  {
    from: 'agent' as const,
    text: 'No es emergencia, pero retrasarlo suele salir más caro. Te propongo ventana jueves 10:00–11:00: lo recogemos en Chamberí y te lo devolvemos el mismo día.',
  },
  {
    from: 'client' as const,
    text: 'Vale, el jueves me encaja. ¿Cuánto aproximadamente?',
  },
  {
    from: 'agent' as const,
    text: 'Te envío presupuesto orientativo (con IVA) y dejo la recogida agendada. ¿Confirmamos jueves 10:00–11:00?',
  },
  {
    from: 'client' as const,
    text: 'Confirmado.',
  },
];

export const AlertasIA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const visibleCount = Math.min(
    ALL_MSGS.length,
    1 + Math.floor(interpolate(frame, [60, 480], [0, ALL_MSGS.length - 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })),
  );
  const messages = ALL_MSGS.slice(0, visibleCount);

  return (
    <SceneShell>
      <AbsoluteFill style={{ padding: '72px 56px 36px' }}>
        <VisualTitle
          kicker="06 · Alertas inteligentes + WhatsApp"
          title="Cada chequeo es una oportunidad"
          subtitle="Los 20 puntos del chequeo visual alimentan alertas de futuros servicios. Un agente por WhatsApp propone, resuelve objeciones y cierra con agenda de retiro."
        />

        <div
          style={{
            marginTop: 32,
            display: 'flex',
            gap: 36,
            alignItems: 'flex-start',
          }}
        >
          {/* Pipeline */}
          <div style={{ width: 380, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { t: 'Chequeo visual', d: '20 puntos registrados en la app' },
              { t: 'Hallazgo → alerta', d: 'Frenos / ITV / mantenimiento' },
              { t: 'Agente WhatsApp', d: 'Propone servicio y ventana' },
              { t: 'Cierre + ruta', d: 'Agenda de retiro y nueva tarea' },
            ].map((s, i) => {
              const enter = springIn(frame, fps, 16 + i * 14);
              const on = frame > 40 + i * 50;
              return (
                <div
                  key={s.t}
                  style={{
                    opacity: enter,
                    display: 'flex',
                    gap: 14,
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: on ? colors.electric100 : colors.neutral0,
                    border: `1px solid ${on ? colors.electric600 : colors.neutral200}`,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: colors.emerald800,
                      color: colors.electric300,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800 }}>{s.t}</div>
                    <div style={{ fontSize: 13, color: colors.neutral600 }}>{s.d}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              opacity: springIn(frame, fps, 20),
              transform: `translateY(${interpolate(springIn(frame, fps, 20), [0, 1], [24, 0])}px)`,
            }}
          >
            <PhoneChrome width={280} height={560}>
              <ConductorJornada step="chequeo" />
            </PhoneChrome>
          </div>

          <div
            style={{
              opacity: springIn(frame, fps, 40),
              transform: `translateY(${interpolate(springIn(frame, fps, 40), [0, 1], [28, 0])}px)`,
            }}
          >
            <WhatsAppChat messages={messages} width={400} height={560} />
          </div>
        </div>

        {frame > 200 ? (
          <ChannelNotice
            channel="whatsapp"
            from="Agente Mecanu"
            preview="Propuesta de frenos + ventana jueves 10:00–11:00."
            delay={0}
            x={56}
            y={780}
          />
        ) : null}
        {frame > 420 ? (
          <ChannelNotice
            channel="email"
            from="campañas@taller"
            preview="Alerta inteligente convertida en ruta TR-1140."
            delay={0}
            x={480}
            y={780}
          />
        ) : null}
      </AbsoluteFill>
    </SceneShell>
  );
};
