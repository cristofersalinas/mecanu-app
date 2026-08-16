import type { CSSProperties } from 'react';
import { Icon } from './Icon';

export type TimeWindowSize = 'default' | 'large';

export interface TimeWindowProps {
  start?: string;
  end?: string;
  date?: string;
  size?: TimeWindowSize;
  style?: CSSProperties;
}

export function TimeWindow({ start = '10:00', end, date, size = 'default', style }: TimeWindowProps) {
  // Regla dura: si no se pasa fin, se ofrece una ventana de 1 hora desde el inicio.
  const computedEnd =
    end ||
    (() => {
      const [h, m] = start.split(':').map(Number);
      return String((h! + 1) % 24).padStart(2, '0') + ':' + String(m || 0).padStart(2, '0');
    })();
  const big = size === 'large';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--mecanu-space-2)',
        fontFamily: 'var(--mecanu-font-family)',
        fontSize: big ? 'var(--mecanu-font-size-h4)' : 'var(--mecanu-font-size-h5)',
        lineHeight: big ? 'var(--mecanu-line-height-h4)' : 'var(--mecanu-line-height-h5)',
        fontWeight: 700,
        color: 'var(--mecanu-text-primary-light)',
        ...style,
      }}
    >
      <Icon name="schedule" size={big ? 'md' : 'sm'} color="var(--mecanu-text-secondary-light)" />
      {date ? <span style={{ fontWeight: 400, color: 'var(--mecanu-text-secondary-light)' }}>{date} ·</span> : null}
      {start}–{computedEnd}
    </span>
  );
}
