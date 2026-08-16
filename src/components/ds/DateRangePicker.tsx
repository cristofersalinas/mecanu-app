'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from './Icon';
import styles from './DateRangePicker.module.css';

export interface DateRange {
  start: number | null;
  end: number | null;
}

export type DateRangeTimeField = 'start' | 'end';

export interface DateRangePickerProps {
  month?: number;
  year?: number;
  range?: DateRange;
  onChange?: (range: DateRange) => void;
  showTime?: boolean;
  startTime?: string;
  endTime?: string;
  onTimeChange?: (field: DateRangeTimeField, value: string) => void;
  style?: CSSProperties;
}

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
const DOW = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

export function DateRangePicker({
  month = 6,
  year = 2026,
  range,
  onChange,
  showTime = true,
  startTime = '10:30',
  endTime = '12:30',
  onTimeChange,
  style,
}: DateRangePickerProps) {
  const [m, setM] = useState(month);
  const [y, setY] = useState(year);
  const [r, setR] = useState<DateRange>(range || { start: null, end: null });

  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();

  const pick = (d: number) => {
    let next: DateRange;
    if (!r.start || (r.start && r.end)) {
      next = { start: d, end: null };
    } else {
      next = d >= r.start ? { start: r.start, end: d } : { start: d, end: r.start };
    }
    setR(next);
    onChange?.(next);
  };

  const prev = () => {
    if (m === 0) {
      setM(11);
      setY(y - 1);
    } else {
      setM(m - 1);
    }
  };

  const next = () => {
    if (m === 11) {
      setM(0);
      setY(y + 1);
    } else {
      setM(m + 1);
    }
  };

  return (
    <div className={styles.wrap} style={style}>
      <div className={styles.head}>
        <button type="button" aria-label="Mes anterior" className={styles.navBtn} onClick={prev}>
          <Icon name="chevron_left" size="md" />
        </button>
        <span className={styles.monthLabel}>
          {MESES[m]} de {y}
        </span>
        <button type="button" aria-label="Mes siguiente" className={styles.navBtn} onClick={next}>
          <Icon name="chevron_right" size="md" />
        </button>
      </div>
      <div className={styles.grid}>
        {DOW.map((d) => (
          <span key={d} className={styles.dow}>
            {d}
          </span>
        ))}
        {Array.from({ length: first }).map((_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const edge = d === r.start || d === r.end;
          const inR = Boolean(r.start && r.end && d > r.start && d < r.end);
          return (
            <button
              key={d}
              type="button"
              className={`${styles.day} ${edge ? styles.isEdge : ''} ${inR ? styles.inRange : ''}`}
              onClick={() => pick(d)}
            >
              {d}
            </button>
          );
        })}
      </div>
      {showTime ? (
        <div className={styles.timeSection}>
          <label>Hora de inicio</label>
          <span className={styles.timeRow}>
            <Icon name="schedule" size="sm" color="var(--mecanu-text-secondary-light)" />
            <input
              type="time"
              defaultValue={startTime}
              onChange={(e) => onTimeChange?.('start', e.target.value)}
            />
          </span>
          <label>Hora de fin</label>
          <span className={styles.timeRow}>
            <Icon name="schedule" size="sm" color="var(--mecanu-text-secondary-light)" />
            <input type="time" defaultValue={endTime} onChange={(e) => onTimeChange?.('end', e.target.value)} />
          </span>
        </div>
      ) : null}
    </div>
  );
}
