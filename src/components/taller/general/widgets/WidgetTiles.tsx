'use client';

import { Icon } from '@/components/ds/Icon';
import { columnasGrupo } from '@/lib/mecanu/dashboard-widget-layout';
import { DashboardWidgetShell } from '../DashboardWidgetShell';

export function WidgetTiles({
  titulo = 'Indicadores',
  items,
  gridW = 8,
  editing,
  onRemove,
}: {
  titulo?: string;
  items: { icon: string; label: string; valor: string }[];
  gridW?: number;
  editing?: boolean;
  onRemove?: () => void;
}) {
  const cols = columnasGrupo(items.length, gridW);

  return (
    <DashboardWidgetShell titulo={titulo} icon="speed" editing={editing} onRemove={onRemove}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: 12,
          alignContent: 'start',
          flex: 1,
          minHeight: 0,
        }}
      >
        {items.map((k) => (
          <div key={k.label} style={{ padding: 12, borderRadius: 10, background: 'var(--mecanu-neutral-25)', minWidth: 0 }}>
            <Icon name={k.icon} size="sm" />
            <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)', marginTop: 4 }}>{k.label}</div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{k.valor}</div>
          </div>
        ))}
      </div>
    </DashboardWidgetShell>
  );
}
