'use client';

import { Icon } from '@/components/ds/Icon';
import type { Foto } from './types';

/**
 * Rejilla de fotos obligatorias. Cada hueco es un disparador de cámara
 * (`CameraTrigger`): tocarlo abre la cámara de la app, nunca la galería.
 * Una foto hecha queda sellada y no se puede sustituir desde aquí.
 */
export function EvidenceGrid({
  slots,
  fotos,
  alto = 104,
  onAbrir,
}: {
  slots: { key: string; label: string }[];
  fotos: Record<string, Foto>;
  alto?: number;
  onAbrir: (key: string) => void;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {slots.map((s) => {
        const f = fotos[s.key];
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onAbrir(s.key)}
            aria-label={f ? s.label + ' · foto sellada, tocar para repetir' : 'Hacer foto ' + s.label}
            style={{
              position: 'relative',
              height: alto,
              border: '1px ' + (f ? 'solid var(--mecanu-neutral-900)' : 'dashed var(--mecanu-border)'),
              borderRadius: 10,
              background: f ? 'var(--mecanu-neutral-900)' : 'var(--mecanu-neutral-25)',
              cursor: 'pointer',
              font: 'inherit',
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            {f ? (
              <>
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url("${f.src}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(22,23,24,.72)',
                    color: 'var(--mecanu-neutral-0)',
                    fontSize: 10,
                    lineHeight: '13px',
                    fontWeight: 700,
                    padding: '4px 6px',
                    textAlign: 'left',
                  }}
                >
                  {s.label} · sellada
                </span>
              </>
            ) : (
              <>
                <Icon name="photo_camera" size="xl" color="var(--mecanu-neutral-700)" />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--mecanu-neutral-700)',
                    textAlign: 'center',
                    padding: '0 6px',
                  }}
                >
                  {s.label}
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
