import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneShell } from '../components/SceneShell';
import { VisualTitle } from '../components/VisualTitle';
import { colors } from '../lib/theme';
import { springIn } from '../lib/animations';

/**
 * Beneficios anclados a docs/PROPUESTA-VALOR.md.
 * Sin cifras inventadas de ingresos / % — solo claims permitidos.
 */
const METRICS = [
  {
    value: '7 días',
    label: 'Menos coordinación',
    text: 'Se acabó la semana típica cuadrando cuándo puede traer el coche. Ventana de 1 h y recogida en domicilio.',
  },
  {
    value: '1 h',
    label: 'Ventana, no hora exacta',
    text: 'El cliente entiende el rango. El taller y el conductor operan sin inventar puntualidad falsa.',
  },
  {
    value: '+ radio',
    label: 'Más kilómetros cubiertos',
    text: 'Clientes que viven lejos dejan de ser inviables: la logística acerca la nave al código postal.',
  },
  {
    value: '+ plazas',
    label: 'Más rotación',
    text: 'El coche listo no duerme en la nave. Lo devuelves y abres hueco para otra OR el mismo día.',
  },
  {
    value: '20 pts',
    label: 'Chequeo → ingreso futuro',
    text: 'Cada punto del chequeo visual puede abrir una alerta de modernización o mantenimiento.',
  },
  {
    value: 'WA',
    label: 'Recurrencia con agente',
    text: 'Las alertas inteligentes van acompañadas de conversación automática hasta cerrar agenda de retiro.',
  },
];

export const Metricas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneShell>
      <AbsoluteFill style={{ padding: '88px 64px 48px' }}>
        <VisualTitle
          kicker="08 · Beneficios"
          title="Lo que cambia en la experiencia del taller"
          subtitle="Métricas de producto ancladas a operación real: coordinación, radio, rotación y oportunidades del chequeo."
        />
        <div
          style={{
            marginTop: 40,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 16,
          }}
        >
          {METRICS.map((m, i) => {
            const enter = springIn(frame, fps, 18 + i * 10);
            return (
              <div
                key={m.label}
                style={{
                  opacity: enter,
                  transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px)`,
                  background: colors.neutral0,
                  border: `1px solid ${colors.neutral200}`,
                  borderRadius: 18,
                  padding: '22px 22px 20px',
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: colors.electric600,
                    lineHeight: 1,
                  }}
                >
                  {m.value}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: colors.neutral600,
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 15,
                    lineHeight: 1.4,
                    color: colors.neutral700,
                    flex: 1,
                  }}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
