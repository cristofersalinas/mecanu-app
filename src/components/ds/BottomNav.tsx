import type { CSSProperties } from 'react';
import { Icon } from './Icon';
import styles from './BottomNav.module.css';

export interface BottomNavItem {
  id: string;
  icon: string;
  label: string;
}

export interface BottomNavProps {
  items?: BottomNavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  style?: CSSProperties;
}

export function BottomNav({ items = [], activeId, onSelect, style }: BottomNavProps) {
  return (
    <nav className={styles.nav} style={style}>
      {items.map((it) => {
        const active = it.id === activeId;
        return (
          <button
            key={it.id}
            type="button"
            aria-current={active ? 'page' : undefined}
            className={active ? styles.active : ''}
            onClick={() => onSelect?.(it.id)}
          >
            <Icon name={it.icon} size="lg" filled={active} />
            {it.label}
          </button>
        );
      })}
    </nav>
  );
}
