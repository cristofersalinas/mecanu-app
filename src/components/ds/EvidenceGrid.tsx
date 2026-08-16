import type { CSSProperties } from 'react';
import { Icon } from './Icon';

export type EvidenceSlotStatus = 'approved' | 'retry' | 'empty';

export interface EvidenceSlot {
  label?: string;
  src?: string;
  status?: EvidenceSlotStatus;
}

export interface EvidenceGridProps {
  slots?: EvidenceSlot[];
  columns?: number;
  onSlotClick?: (slot: EvidenceSlot, index: number) => void;
  style?: CSSProperties;
}

const STATUS: Record<EvidenceSlotStatus, { border: string; icon: string; color: string }> = {
  approved: { border: 'var(--mecanu-positive)', icon: 'check_circle', color: 'var(--mecanu-positive)' },
  retry: { border: 'var(--mecanu-alert)', icon: 'replay', color: 'var(--mecanu-alert)' },
  empty: { border: 'var(--mecanu-border)', icon: 'photo_camera', color: 'var(--mecanu-text-disabled-light)' },
};

export function EvidenceGrid({ slots = [], columns = 2, onSlotClick, style }: EvidenceGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 'var(--mecanu-space-3)',
        fontFamily: 'var(--mecanu-font-family)',
        ...style,
      }}
    >
      {slots.map((s, i) => {
        const st = STATUS[s.status || 'empty'];
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSlotClick?.(s, i)}
            style={{
              position: 'relative',
              aspectRatio: '4/3',
              borderRadius: 'var(--mecanu-radius-200)',
              border: `2px solid ${st.border}`,
              background: s.src ? 'none' : 'var(--mecanu-bg-secondary-light)',
              overflow: 'hidden',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'var(--mecanu-touch-target-min)',
            }}
          >
            {s.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.src}
                alt={s.label}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Icon name="photo_camera" size="xl" color="var(--mecanu-text-disabled-light)" />
            )}
            {s.label ? (
              <span
                style={{
                  position: 'absolute',
                  left: 8,
                  bottom: 8,
                  background: 'rgba(22,23,24,.72)',
                  color: 'var(--mecanu-neutral-0)',
                  fontSize: 'var(--mecanu-font-size-caption)',
                  lineHeight: 'var(--mecanu-line-height-caption)',
                  fontWeight: 700,
                  borderRadius: 'var(--mecanu-radius-100)',
                  padding: '2px 8px',
                }}
              >
                {s.label}
              </span>
            ) : null}
            {s.status && s.status !== 'empty' ? (
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'inline-flex',
                  background: 'var(--mecanu-neutral-0)',
                  borderRadius: 999,
                }}
              >
                <Icon name={st.icon} size="md" filled color={st.color} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
