import React from 'react';
import { staticFile } from 'remotion';
import { colors } from '../lib/theme';

/** Volante tintado con la marca (mask CSS). */
export function VolanteTint({
  size = 72,
  color = colors.electric600,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: `url(${staticFile('volante.svg')})`,
        maskImage: `url(${staticFile('volante.svg')})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  );
}
