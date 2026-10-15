'use client';

import { ErrorState } from '@/components/ds/ErrorState';
import { DashboardWidgetShell } from '../DashboardWidgetShell';
import { WidgetBodyScroll } from './WidgetBodyScroll';

export function WidgetLista({
  titulo,
  items,
  editing,
  onRemove,
  onSelect,
}: {
  titulo?: string;
  items: { id: string; primary: string; secondary?: string }[];
  editing?: boolean;
  onRemove?: () => void;
  onSelect?: (id: string) => void;
}) {
  return (
    <DashboardWidgetShell titulo={titulo} icon="list" editing={editing} onRemove={onRemove}>
      <WidgetBodyScroll>
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => onSelect?.(it.id)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '10px 0',
              border: 'none', borderBottom: '1px solid var(--mecanu-border-subtle)',
              background: 'none', cursor: onSelect ? 'pointer' : 'default',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600 }}>{it.primary}</div>
            {it.secondary ? (
              <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>{it.secondary}</div>
            ) : null}
          </button>
        ))}
        {items.length === 0 ? (
          <ErrorState variant="empty" compact message="Lista vacía." />
        ) : null}
      </WidgetBodyScroll>
    </DashboardWidgetShell>
  );
}
