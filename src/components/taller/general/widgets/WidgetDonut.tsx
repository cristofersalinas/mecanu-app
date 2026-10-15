'use client';

import { ErrorState } from '@/components/ds/ErrorState';
import { DashboardWidgetShell } from '../DashboardWidgetShell';

const COLORES = [
  'var(--mecanu-electric-600)',
  'var(--mecanu-emerald-600, #0d9488)',
  'var(--mecanu-neutral-300)',
  'var(--mecanu-alert)',
  'var(--mecanu-positive)',
  '#94a3b8',
];

export type DonutSlice = { label: string; valor: number; color?: string };

export function WidgetDonut({
  titulo,
  slices,
  editing,
  onRemove,
}: {
  titulo?: string;
  slices: DonutSlice[];
  editing?: boolean;
  onRemove?: () => void;
}) {
  const total = slices.reduce((a, s) => a + s.valor, 0);
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 58;
  const stroke = 22;

  const arcs = slices.reduce<{ angle: number; items: Array<DonutSlice & { d: string; color: string }> }>(
    (acc, s, i) => {
      const frac = total > 0 ? s.valor / total : 0;
      const sweep = frac * Math.PI * 2;
      const start = acc.angle;
      const large = sweep > Math.PI ? 1 : 0;
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(start + sweep);
      const y2 = cy + r * Math.sin(start + sweep);
      const d = sweep < 0.001
        ? ''
        : `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
      return {
        angle: start + sweep,
        items: [...acc.items, { ...s, d, color: s.color ?? COLORES[i % COLORES.length]! }],
      };
    },
    { angle: -Math.PI / 2, items: [] },
  ).items;

  return (
    <DashboardWidgetShell titulo={titulo} icon="pie_chart" editing={editing} onRemove={onRemove}>
      {total === 0 ? (
        <ErrorState variant="empty" compact message="Sin datos para el gráfico." />
      ) : (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={titulo}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--mecanu-neutral-25)" strokeWidth={stroke} />
            {arcs.map((a, i) => (
              a.d ? (
                <path
                  key={i}
                  d={a.d}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={stroke}
                  strokeLinecap="butt"
                >
                  <title>{`${a.label}: ${a.valor}`}</title>
                </path>
              ) : null
            ))}
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize={18} fontWeight={800} fill="var(--mecanu-text)">
              {total}
            </text>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120 }}>
            {slices.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color ?? COLORES[i % COLORES.length], flex: 'none' }} />
                <span style={{ flex: 1, color: 'var(--mecanu-text-secondary-light)' }}>{s.label}</span>
                <span style={{ fontWeight: 700 }}>{s.valor}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardWidgetShell>
  );
}
