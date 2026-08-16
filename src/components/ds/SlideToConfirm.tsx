'use client';

import { useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { Icon } from './Icon';

export interface SlideToConfirmProps {
  label?: string;
  confirmedLabel?: string;
  onConfirm?: () => void;
  style?: CSSProperties;
}

const THUMB = 56;
const PAD = 4;

export function SlideToConfirm({
  label = 'Desliza para confirmar',
  confirmedLabel = 'Confirmado',
  onConfirm,
  style,
}: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const [done, setDone] = useState(false);

  const max = () => (trackRef.current ? trackRef.current.offsetWidth - THUMB - PAD * 2 : 200);

  const move = (clientX: number) => {
    if (done) return;
    const rect = trackRef.current!.getBoundingClientRect();
    setX(Math.min(max(), Math.max(0, clientX - rect.left - THUMB / 2 - PAD)));
  };

  const end = () => {
    if (done) return;
    setDrag(false);
    if (x >= max() * 0.92) {
      setX(max());
      setDone(true);
      onConfirm?.();
    } else {
      setX(0);
    }
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLSpanElement>) => {
    setDrag(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (drag) move(e.clientX);
  };

  return (
    <div
      ref={trackRef}
      style={{
        position: 'relative',
        height: 64,
        borderRadius: 'var(--mecanu-radius-full)',
        background: done ? 'var(--mecanu-electric-100)' : 'var(--mecanu-bg-tertiary-light)',
        fontFamily: 'var(--mecanu-font-family)',
        userSelect: 'none',
        touchAction: 'none',
        overflow: 'hidden',
        ...style,
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 'var(--mecanu-font-size-body)',
          color: done ? 'var(--mecanu-emerald-800)' : 'var(--mecanu-text-secondary-light)',
          opacity: done ? 1 : 1 - x / 150,
          transition: drag ? 'none' : 'opacity 200ms var(--mecanu-ease-linear)',
        }}
      >
        {done ? confirmedLabel : label}
      </span>
      <span
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          width: 56,
          height: 56,
          borderRadius: 999,
          background: 'var(--mecanu-brand-primary-dark)',
          color: 'var(--mecanu-text-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: done ? 'default' : 'grab',
          transform: `translateX(${x}px)`,
          transition: drag ? 'none' : 'transform 500ms var(--mecanu-ease-decelerate)',
          boxShadow: 'var(--mecanu-shadow-shallow-down)',
        }}
      >
        <Icon name={done ? 'check' : 'arrow_forward'} size="lg" />
      </span>
    </div>
  );
}
