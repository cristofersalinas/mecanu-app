'use client';

import type { ReactNode } from 'react';
import { Icon } from '@/components/ds/Icon';
import { MetricsCard } from '@/components/ds/MetricsCard';
import { columnasGrupo } from '@/lib/mecanu/dashboard-widget-layout';
import styles from '../../panel.module.css';
import { DashboardWidgetShell } from '../DashboardWidgetShell';

export type KpiGrupoItem = {
  id: string;
  value: ReactNode;
  label: string;
  delta?: string;
  dir?: 'up' | 'down';
};

export function WidgetKpiGrupo({
  titulo,
  items,
  gridW = 12,
  linkLabel,
  onLink,
  editing,
  onRemove,
}: {
  titulo: string;
  items: KpiGrupoItem[];
  /** Ancho del widget en columnas de grid (12). Define 1×N / 2×N/2 / N×1. */
  gridW?: number;
  linkLabel?: string;
  onLink?: () => void;
  editing?: boolean;
  onRemove?: () => void;
}) {
  const cols = columnasGrupo(items.length, gridW);

  return (
    <DashboardWidgetShell
      titulo={titulo}
      editing={editing}
      onRemove={onRemove}
      headerRight={linkLabel && onLink ? (
        <button
          type="button"
          className={styles.linkBtn}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}
          onClick={onLink}
        >
          {linkLabel}
          <Icon name="arrow_forward" size="sm" />
        </button>
      ) : undefined}
    >
      <div
        className="mcn-metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: 12,
          flex: 1,
          minHeight: 0,
          alignContent: 'start',
        }}
      >
        {items.map((k) => (
          <MetricsCard
            key={k.id}
            value={k.value}
            label={k.label}
            delta={k.delta}
            deltaDirection={k.dir}
            style={{ minWidth: 0, width: '100%' }}
          />
        ))}
      </div>
    </DashboardWidgetShell>
  );
}
