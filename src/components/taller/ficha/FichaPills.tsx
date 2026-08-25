import type { CSSProperties } from 'react';
import type { PillFicha } from './ficha-pills';
import styles from '../panel.module.css';

function estiloPill(color: string): CSSProperties {
  return {
    color,
    border: `1px solid ${color}`,
    background: 'var(--mecanu-neutral-0)',
  };
}

export function FichaPills({ pills }: { pills: PillFicha[] }) {
  if (!pills.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {pills.map((p) => (
        <span
          key={p.id}
          className={styles.cardPill}
          title={p.title}
          style={estiloPill(p.color)}
        >
          {p.label}
        </span>
      ))}
    </div>
  );
}
