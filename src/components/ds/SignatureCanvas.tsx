'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { Button } from './Button';

export interface SignatureCanvasProps {
  height?: number;
  onChange?: (empty: boolean) => void;
  style?: CSSProperties;
}

export function SignatureCanvas({ height = 180, onChange, style }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const scale = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * scale;
    c.height = c.offsetHeight * scale;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.strokeStyle = '#161718';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const pos = (e: ReactPointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = canvasRef.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  const start = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(...pos(e));
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const move = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(...pos(e));
    ctx.stroke();
    if (empty) {
      setEmpty(false);
      onChange?.(false);
    }
  };

  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    setEmpty(true);
    onChange?.(true);
  };

  return (
    <div style={{ fontFamily: 'var(--mecanu-font-family)', ...style }}>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          style={{
            width: '100%',
            height,
            background: 'var(--mecanu-neutral-0)',
            border: '1px solid var(--mecanu-border)',
            borderRadius: 'var(--mecanu-radius-200)',
            touchAction: 'none',
            display: 'block',
          }}
        />
        {empty ? (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--mecanu-text-disabled-light)',
              fontSize: 'var(--mecanu-font-size-h5)',
              pointerEvents: 'none',
            }}
          >
            Firma aquí
          </span>
        ) : null}
      </div>
      <div style={{ marginTop: 'var(--mecanu-space-2)', display: 'flex', justifyContent: 'flex-end' }}>
        <Button kind="tertiary" size="compact" icon="replay" onClick={clear} disabled={empty}>
          Borrar y repetir
        </Button>
      </div>
    </div>
  );
}
