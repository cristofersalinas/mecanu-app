import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { SCENE } from './lib/timing';
import { Intro } from './scenes/Intro';
import { Agenda } from './scenes/Agenda';
import { PanelFeatures } from './scenes/PanelFeatures';
import { ConductorFeatures } from './scenes/ConductorFeatures';
import { Sync } from './scenes/Sync';
import { FlujoE2E } from './scenes/FlujoE2E';
import { Seguro } from './scenes/Seguro';
import { AlertasIA } from './scenes/AlertasIA';
import { ITV } from './scenes/ITV';
import { Metricas } from './scenes/Metricas';
import { Cierre } from './scenes/Cierre';

function offset(...keys: (keyof typeof SCENE)[]) {
  let from = 0;
  const map: Partial<Record<keyof typeof SCENE, number>> = {};
  for (const k of Object.keys(SCENE) as (keyof typeof SCENE)[]) {
    map[k] = from;
    from += SCENE[k];
  }
  return keys.map((k) => map[k]!);
}

export const Lanzamiento: React.FC = () => {
  const [
    intro,
    agenda,
    panel,
    conductor,
    sync,
    flujo,
    seguro,
    alertas,
    itv,
    metricas,
    cierre,
  ] = offset(
    'intro',
    'agenda',
    'panel',
    'conductor',
    'sync',
    'flujo',
    'seguro',
    'alertas',
    'itv',
    'metricas',
    'cierre',
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#FAFAFA' }}>
      <Sequence from={intro} durationInFrames={SCENE.intro}>
        <Intro />
      </Sequence>
      <Sequence from={agenda} durationInFrames={SCENE.agenda}>
        <Agenda />
      </Sequence>
      <Sequence from={panel} durationInFrames={SCENE.panel}>
        <PanelFeatures />
      </Sequence>
      <Sequence from={conductor} durationInFrames={SCENE.conductor}>
        <ConductorFeatures />
      </Sequence>
      <Sequence from={sync} durationInFrames={SCENE.sync}>
        <Sync />
      </Sequence>
      <Sequence from={flujo} durationInFrames={SCENE.flujo}>
        <FlujoE2E />
      </Sequence>
      <Sequence from={seguro} durationInFrames={SCENE.seguro}>
        <Seguro />
      </Sequence>
      <Sequence from={alertas} durationInFrames={SCENE.alertas}>
        <AlertasIA />
      </Sequence>
      <Sequence from={itv} durationInFrames={SCENE.itv}>
        <ITV />
      </Sequence>
      <Sequence from={metricas} durationInFrames={SCENE.metricas}>
        <Metricas />
      </Sequence>
      <Sequence from={cierre} durationInFrames={SCENE.cierre}>
        <Cierre />
      </Sequence>
    </AbsoluteFill>
  );
};
