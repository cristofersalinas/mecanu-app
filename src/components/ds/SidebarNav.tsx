import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';
import { Logo } from './Logo';
import styles from './SidebarNav.module.css';

export interface SidebarNavItem {
  id: string;
  icon: string;
  label: string;
}

export interface SidebarNavProps {
  items?: SidebarNavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  footer?: ReactNode;
  style?: CSSProperties;
}

export function SidebarNav({ items = [], activeId, onSelect, footer, style }: SidebarNavProps) {
  return (
    <nav className={styles.nav} style={style}>
      <div className={styles.logoWrap}>
        <Logo variant="light" height={20} />
      </div>
      <div className={styles.list}>
        {items.map((it) => {
          const active = it.id === activeId;
          return (
            <button
              key={it.id}
              type="button"
              className={`${styles.item} ${active ? styles.active : ''}`}
              onClick={() => onSelect?.(it.id)}
            >
              <Icon name={it.icon} size="md" filled={active} />
              {it.label}
            </button>
          );
        })}
      </div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </nav>
  );
}
