import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneShell } from '../components/SceneShell';
import { VisualTitle } from '../components/VisualTitle';
import { PanelKanban } from '../mockups/PanelKanban';
import { Cursor } from '../components/Cursor';
import { colors } from '../lib/theme';
import { cursorPath, springIn } from '../lib/animations';

const FEATURES = [
  'Tablero de 6 columnas: Prospectos → Completado',
  'Solo Prospectos es arrastrable; el resto avanza con confirmación',
  'Ventana de 1 h, cobertura de seguro siempre visible',
  'Presupuesto en Campañas: una sola fuente de verdad',
];

export const PanelFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panelEnter = springIn(frame, fps, 12);
  const cursor = cursorPath(frame, [
    { f: 0, x: 1460, y: 820 },
    { f: 40, x: 820, y: 420 },
    { f: 90, x: 820, y: 420 },
    { f: 130, x: 980, y: 280 },
    { f: 180, x: 980, y: 280 },
    { f: 230, x: 1180, y: 220 },
  ]);
  const hovering = frame >= 40 && frame <= 100;
  const clicking = frame >= 100 && frame <= 118;

  return (
    <SceneShell>
      <AbsoluteFill style={{ padding: '88px 56px 40px' }}>
        <div style={{ display: 'flex', gap: 40, height: '100%' }}>
          <div style={{ width: 420, flex: 'none', paddingTop: 12 }}>
            <VisualTitle
              kicker="01 · Panel del taller"
              title="El kanban que mueve la nave"
              subtitle="Operación diaria: rutas, ventanas, seguro y presupuesto — sin inventar datos."
            />
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FEATURES.map((f, i) => {
                const enter = springIn(frame, fps, 40 + i * 14);
                return (
                  <div
                    key={f}
                    style={{
                      opacity: enter,
                      transform: `translateX(${interpolate(enter, [0, 1], [-16, 0])}px)`,
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      fontSize: 16,
                      lineHeight: 1.4,
                      color: colors.neutral800,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        marginTop: 7,
                        borderRadius: 999,
                        background: colors.electric600,
                        flex: 'none',
                      }}
                    />
                    {f}
                  </div>
                );
              })}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              opacity: panelEnter,
              transform: `translateY(${interpolate(panelEnter, [0, 1], [40, 0])}px) scale(${interpolate(panelEnter, [0, 1], [0.96, 1])})`,
            }}
          >
            <PanelKanban width={1120} height={620} highlightCard={hovering || clicking} />
            <Cursor x={cursor.x} y={cursor.y} clicking={clicking} />
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
