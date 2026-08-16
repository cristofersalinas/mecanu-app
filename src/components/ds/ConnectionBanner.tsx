import type { CSSProperties } from 'react';
import { Icon } from './Icon';
import styles from './ConnectionBanner.module.css';

export type ConnectionStatus = 'offline' | 'syncing' | 'synced';

export interface ConnectionBannerProps {
  status?: ConnectionStatus;
  queuedCount?: number;
  style?: CSSProperties;
}

const STATUS_MAP: Record<ConnectionStatus, { bg: string; fg: string; icon: string | null; text: (n: number) => string }> = {
  offline: {
    bg: '#FDEBDD',
    fg: '#9C420B',
    icon: 'wifi_off',
    text: (n) => (n ? `${n} cambio(s) en cola — se enviarán al recuperar señal` : 'Sin conexión — tus cambios se guardan y se enviarán solos'),
  },
  syncing: {
    bg: 'var(--mecanu-electric-100)',
    fg: 'var(--mecanu-emerald-800)',
    icon: null,
    text: () => 'Sincronizando cambios…',
  },
  synced: {
    bg: 'var(--mecanu-electric-100)',
    fg: 'var(--mecanu-emerald-800)',
    icon: 'cloud_done',
    text: () => 'Todo sincronizado',
  },
};

export function ConnectionBanner({ status = 'offline', queuedCount = 0, style }: ConnectionBannerProps) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.offline;
  return (
    <div className={styles.banner} role="status" style={{ background: s.bg, color: s.fg, ...style }}>
      {status === 'syncing' ? <span className={styles.spin} /> : <Icon name={s.icon ?? ''} size="sm" />}
      <span>{s.text(queuedCount)}</span>
    </div>
  );
}
