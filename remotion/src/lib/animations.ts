import { interpolate, spring, Easing } from 'remotion';

export function fadeIn(frame: number, start: number, dur = 18) {
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

export function fadeOut(frame: number, start: number, dur = 14) {
  return interpolate(frame, [start, start + dur], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

export function slideUp(
  frame: number,
  fps: number,
  delay = 0,
  from = 36,
) {
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.8 },
  }) * from;
}

export function springIn(frame: number, fps: number, delay = 0) {
  return spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 180, stiffness: 140, mass: 0.7 },
  });
}

export function easeMove(
  frame: number,
  fromFrame: number,
  toFrame: number,
  from: number,
  to: number,
) {
  return interpolate(frame, [fromFrame, toFrame], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
}

/** Cursor: trayectoria con pausa al hover. */
export function cursorPath(
  frame: number,
  stops: { f: number; x: number; y: number }[],
): { x: number; y: number } {
  if (stops.length === 0) return { x: 0, y: 0 };
  if (frame <= stops[0].f) return { x: stops[0].x, y: stops[0].y };
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (frame <= b.f) {
      const t = (frame - a.f) / Math.max(1, b.f - a.f);
      const e = Easing.bezier(0.4, 0, 0.2, 1)(t);
      return {
        x: a.x + (b.x - a.x) * e,
        y: a.y + (b.y - a.y) * e,
      };
    }
  }
  const last = stops[stops.length - 1];
  return { x: last.x, y: last.y };
}
