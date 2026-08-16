import type { CSSProperties, ReactNode } from 'react';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: ReactNode;
}

export interface TabsProps {
  items?: TabItem[];
  activeId?: string;
  onChange?: (id: string) => void;
  style?: CSSProperties;
}

export function Tabs({ items = [], activeId, onChange, style }: TabsProps) {
  return (
    <div className={styles.tabs} role="tablist" style={style}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          aria-selected={it.id === activeId}
          className={`${styles.tab} ${it.id === activeId ? styles.active : ''}`}
          onClick={() => onChange?.(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
