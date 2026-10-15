'use client';

import { ErrorState } from '@/components/ds/ErrorState';
import { Icon } from '@/components/ds/Icon';
import styles from '../../panel.module.css';
import { DashboardWidgetShell } from '../DashboardWidgetShell';
import { WidgetBodyScroll } from './WidgetBodyScroll';

function iniciales(nombre: string): string {
  return nombre.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export type RankingItem = {
  id: string;
  nombre: string;
  calif: string | null;
  valor: number;
};

export function WidgetRanking({
  titulo = 'Ranking',
  items,
  modo,
  onModo,
  editing,
  onRemove,
}: {
  titulo?: string;
  items: RankingItem[];
  modo?: 'conductor' | 'cliente';
  onModo?: (m: 'conductor' | 'cliente') => void;
  editing?: boolean;
  onRemove?: () => void;
}) {
  return (
    <DashboardWidgetShell
      titulo={titulo}
      icon="leaderboard"
      editing={editing}
      onRemove={onRemove}
      headerRight={onModo && modo ? (
        <div className={styles.segmentSwitch} role="group" aria-label="Tipo de ranking">
          {(['conductor', 'cliente'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onModo(r)}
              className={`${styles.segmentSwitchBtn}${modo === r ? ` ${styles.segmentSwitchBtnOn}` : ''}`}
              aria-pressed={modo === r}
            >
              {r === 'conductor' ? 'Conductor' : 'Cliente'}
            </button>
          ))}
        </div>
      ) : undefined}
    >
      <WidgetBodyScroll>
        {items.map((r, i) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
            <span style={{ width: 18, fontSize: 12, fontWeight: 800, color: 'var(--mecanu-neutral-300)' }}>{i + 1}</span>
            <span
              style={{
                display: 'flex', width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', background: 'var(--mecanu-electric-100)', fontSize: 11, fontWeight: 800,
                color: 'var(--mecanu-emerald-800)', flex: 'none',
              }}
            >
              {iniciales(r.nombre)}
            </span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nombre}</span>
            {r.calif ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--mecanu-text-secondary-light)', flex: 'none' }}>
                <Icon name="star" size="sm" filled />
                {r.calif}
              </span>
            ) : null}
            <span style={{ fontSize: 13, fontWeight: 700, flex: 'none' }}>{r.valor}</span>
          </div>
        ))}
        {items.length === 0 ? <ErrorState variant="empty" compact message="Sin datos suficientes para el ranking." /> : null}
      </WidgetBodyScroll>
    </DashboardWidgetShell>
  );
}
