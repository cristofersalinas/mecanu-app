import type { CSSProperties } from 'react';
import styles from './StatusTimeline.module.css';

export interface StatusTimelineProps {
  steps?: string[];
  current?: number;
  style?: CSSProperties;
}

export function StatusTimeline({
  steps = ['Recogida', 'Tránsito', 'En Taller', 'Devolución'],
  current = 0,
  style,
}: StatusTimelineProps) {
  return (
    <div className={styles.timeline} style={style}>
      {steps.map((s, i) => {
        const stepClass = i < current ? styles.done : i === current ? styles.current : '';
        return (
          <div key={i} className={`${styles.step} ${stepClass}`}>
            {i < steps.length - 1 ? <span className={styles.bar} /> : null}
            <span className={styles.dot}>
              {i < current ? (
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path
                    d="M2 6.5 L4.8 9 L10 3.5"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--mecanu-neutral-0)' }} />
              )}
            </span>
            <span className={styles.lbl}>{s}</span>
          </div>
        );
      })}
    </div>
  );
}
