import React from 'react';
import { Composition } from 'remotion';
import { Lanzamiento } from './Lanzamiento';
import { TOTAL_FRAMES } from './lib/timing';
import { fps, height, width } from './lib/theme';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Lanzamiento"
        component={Lanzamiento}
        durationInFrames={TOTAL_FRAMES}
        fps={fps}
        width={width}
        height={height}
      />
    </>
  );
};
