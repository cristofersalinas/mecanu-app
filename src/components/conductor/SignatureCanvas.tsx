'use client';

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';

/**
 * Firma del cliente en la devolución. Se dibuja con el dedo sobre el móvil del
 * conductor; el trazo se sella con hora y GPS al confirmar la entrega.
 * TODO DS: sustituir por `@/components/ds/SignatureCanvas` cuando exista.
 */
export function SignatureCanvas({
  firmada,
  onFirmar,
  onBorrar,
  titulo,
}: {
  firmada: boolean;
  onFirmar: () => void;
  onBorrar: () => void;
  titulo: string;
}) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const pintando = useRef(false);

  const ctx = useCallback(() => canvas.current?.getContext('2d') ?? null, []);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 2;
    el.width = Math.round((r.width || 320) * dpr);
    el.height = Math.round((r.height || 172) * dpr);
    const g = el.getContext('2d');
    if (!g) return;
    g.scale(dpr, dpr);
    g.lineWidth = 2.4;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.strokeStyle = '#161718';
  }, []);

  const punto = (e: ReactPointerEvent<HTMLCanvasElement>): [number, number] => {
    const b = e.currentTarget.getBoundingClientRect();
    return [e.clientX - b.left, e.clientY - b.top];
  };

  const borrar = useCallback(() => {
    const el = canvas.current;
    const g = ctx();
    if (el && g) g.clearRect(0, 0, el.width, el.height);
    onBorrar();
  }, [ctx, onBorrar]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span
          style={{
            flex: 1,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '.05em',
            textTransform: 'uppercase',
            color: 'var(--mecanu-neutral-700)',
          }}
        >
          {titulo}
        </span>
        <button
          type="button"
          onClick={borrar}
          style={{
            flex: 'none',
            minHeight: 40,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            font: 'inherit',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--mecanu-neutral-700)',
            padding: '0 4px',
          }}
        >
          Borrar
        </button>
      </div>
      <canvas
        ref={canvas}
        aria-label="Zona de firma"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          pintando.current = true;
          const g = ctx();
          if (!g) return;
          const [x, y] = punto(e);
          g.beginPath();
          g.moveTo(x, y);
        }}
        onPointerMove={(e) => {
          if (!pintando.current) return;
          e.preventDefault();
          const g = ctx();
          if (!g) return;
          const [x, y] = punto(e);
          g.lineTo(x, y);
          g.stroke();
          if (!firmada) onFirmar();
        }}
        onPointerUp={() => {
          pintando.current = false;
        }}
        onPointerCancel={() => {
          pintando.current = false;
        }}
        style={{
          display: 'block',
          width: '100%',
          height: 172,
          border: '1px solid ' + (firmada ? 'var(--mecanu-neutral-900)' : 'var(--mecanu-border)'),
          borderRadius: 10,
          background: 'var(--mecanu-neutral-25)',
          touchAction: 'none',
        }}
      />
      <div style={{ fontSize: 12, lineHeight: '17px', color: 'var(--mecanu-neutral-700)', marginTop: 7 }}>
        {firmada
          ? 'Firma recogida. Se sella con hora y GPS al confirmar.'
          : 'Pásale el móvil al cliente para que firme con el dedo.'}
      </div>
    </div>
  );
}
