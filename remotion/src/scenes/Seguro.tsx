import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneShell } from '../components/SceneShell';
import { VisualTitle } from '../components/VisualTitle';
import { colors } from '../lib/theme';
import { springIn } from '../lib/animations';

const BLOCKS = [
  {
    title: 'Antes de arrancar',
    items: [
      'Cobertura RC de custodia activa de llaves a firma',
      'Chequeo visual documentado (fotos + firma)',
      'Conductor verificado en la app',
    ],
  },
  {
    title: 'Si hay un choque en el trayecto',
    items: [
      'El RC del taller no cubre el trayecto; el del cliente tampoco al conductor',
      'Mecanu asume la cobertura del traslado (flota externa 100 % asegurada)',
      'El taller abre incidencia en la ruta; queda log y evidencia',
    ],
  },
  {
    title: 'Qué ve el taller',
    items: [
      'Pill de seguro siempre visible en la card',
      'Estado del traslado sin adivinar',
      'Evidencia del check-in / check-out para reclamar',
    ],
  },
];

export const Seguro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneShell dark>
      <AbsoluteFill style={{ padding: '96px 72px 64px' }}>
        <VisualTitle
          dark
          kicker="05 · Seguro en trayecto"
          title="Cuando el coche choca en el camino"
          subtitle="La zona gris del seguro desaparece: el trayecto va con RC de Mecanu y evidencia en cada paso."
        />
        <div
          style={{
            marginTop: 48,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 18,
          }}
        >
          {BLOCKS.map((b, i) => {
            const enter = springIn(frame, fps, 20 + i * 16);
            return (
              <div
                key={b.title}
                style={{
                  opacity: enter,
                  transform: `translateY(${interpolate(enter, [0, 1], [28, 0])}px)`,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 18,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: colors.electric300,
                    marginBottom: 12,
                  }}
                >
                  {b.title}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {b.items.map((it) => (
                    <li
                      key={it}
                      style={{
                        fontSize: 16,
                        lineHeight: 1.4,
                        color: colors.neutral200,
                        paddingLeft: 16,
                        borderLeft: `3px solid ${colors.electric600}`,
                      }}
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 36,
            opacity: springIn(frame, fps, 70),
            fontSize: 18,
            color: colors.neutral300,
            maxWidth: 900,
          }}
        >
          Sin cobertura inventada: si el coche no arranca, sigue haciendo falta una grúa. Mecanu mueve coches que circulan.
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
