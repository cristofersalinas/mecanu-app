'use client';

import { ErrorState } from '@/components/ds/ErrorState';
import { DashboardWidgetShell } from '../DashboardWidgetShell';
import type { BarraPunto } from './WidgetBarras';

export function WidgetLinea({
  titulo = 'Serie',
  puntos,
  total,
  degradado = false,
  editing,
  onRemove,
}: {
  titulo?: string;
  puntos: BarraPunto[];
  total?: number;
  degradado?: boolean;
  editing?: boolean;
  onRemove?: () => void;
}) {
  const max = Math.max(1, ...puntos.map((b) => b.valor));
  const chartH = 140;
  const pad = { l: 8, r: 8, t: 16, b: 24 };
  const w = Math.max(200, puntos.length * 36);
  const innerW = w - pad.l - pad.r;
  const gradId = 'dashLineGrad';

  if (puntos.length === 0) {
    return (
      <DashboardWidgetShell titulo={titulo} icon="show_chart" editing={editing} onRemove={onRemove}>
        <ErrorState variant="empty" compact message="Sin datos para la serie." />
      </DashboardWidgetShell>
    );
  }

  const coords = puntos.map((b, i) => {
    const x = pad.l + (puntos.length === 1 ? innerW / 2 : (i / (puntos.length - 1)) * innerW);
    const y = pad.t + chartH - (b.valor / max) * chartH;
    return { x, y, ...b };
  });
  const d = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const area = `${d} L ${coords[coords.length - 1]!.x} ${pad.t + chartH} L ${coords[0]!.x} ${pad.t + chartH} Z`;

  return (
    <DashboardWidgetShell titulo={titulo} icon="show_chart" editing={editing} onRemove={onRemove}>
      {total != null ? (
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
          {Number.isInteger(total) ? total : total.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
        </div>
      ) : null}
      <svg
        viewBox={`0 0 ${w} ${chartH + pad.t + pad.b}`}
        width="100%"
        height={chartH + pad.t + pad.b}
        role="img"
        aria-label={titulo}
      >
        {degradado ? (
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--mecanu-electric-600)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--mecanu-electric-600)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        ) : null}
        <line
          x1={pad.l}
          y1={pad.t + chartH}
          x2={w - pad.r}
          y2={pad.t + chartH}
          stroke="var(--mecanu-border-subtle)"
        />
        {degradado ? <path d={area} fill={`url(#${gradId})`} stroke="none" /> : null}
        <path d={d} fill="none" stroke="var(--mecanu-electric-600)" strokeWidth={2.5} strokeLinejoin="round" />
        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={3.5} fill="var(--mecanu-electric-600)" />
            <text x={c.x} y={pad.t + chartH + 16} textAnchor="middle" fontSize={11} fill="var(--mecanu-neutral-300)">
              {c.label}
            </text>
          </g>
        ))}
      </svg>
    </DashboardWidgetShell>
  );
}
