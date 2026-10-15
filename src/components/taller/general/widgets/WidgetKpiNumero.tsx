'use client';

import type { ReactNode } from 'react';
import { Icon } from '@/components/ds/Icon';
import { DashboardWidgetShell } from '../DashboardWidgetShell';

/** KPI unitario estilo HubSpot: título, cifra grande, crecimiento. */
export function WidgetKpiNumero({
  value,
  label,
  delta,
  dir,
  editing,
  onRemove,
  titulo,
}: {
  value: ReactNode;
  label: string;
  delta?: string;
  dir?: 'up' | 'down';
  editing?: boolean;
  onRemove?: () => void;
  titulo?: string;
}) {
  const up = dir === 'up';
  const deltaColor = dir
    ? (up ? 'var(--mecanu-positive)' : 'var(--mecanu-alert)')
    : 'var(--mecanu-text-secondary-light)';
  const cabecera = titulo ?? label;

  return (
    <DashboardWidgetShell
      titulo={cabecera}
      editing={editing}
      onRemove={onRemove}
      style={{ padding: 14 }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 6,
          minHeight: 0,
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {value}
        </div>
        {delta ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              fontSize: 12,
              fontWeight: 700,
              color: deltaColor,
            }}
          >
            {dir ? <Icon name={up ? 'arrow_upward' : 'arrow_downward'} size="sm" /> : null}
            {delta}
            {dir ? (
              <span style={{ fontWeight: 500, color: 'var(--mecanu-text-secondary-light)' }}> vs 7d ant.</span>
            ) : null}
          </span>
        ) : null}
      </div>
    </DashboardWidgetShell>
  );
}
