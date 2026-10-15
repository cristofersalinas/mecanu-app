'use client';

import { ErrorState } from '@/components/ds/ErrorState';
import styles from '../../panel.module.css';
import { DashboardWidgetShell } from '../DashboardWidgetShell';

export type BarraPunto = { label: string; valor: number };

export function WidgetBarras({
  titulo = 'Serie',
  puntos,
  total,
  rango,
  onRango,
  degradado = false,
  editing,
  onRemove,
}: {
  titulo?: string;
  puntos: BarraPunto[];
  total: number;
  rango?: '7d' | '1m';
  onRango?: (r: '7d' | '1m') => void;
  degradado?: boolean;
  editing?: boolean;
  onRemove?: () => void;
}) {
  const max = Math.max(1, ...puntos.map((b) => b.valor));
  const chartH = 140;
  const padL = 8;
  const padB = 24;
  const padT = 16;
  const w = Math.max(200, puntos.length * 36);
  const barGap = 0.35;
  const slot = (w - padL * 2) / Math.max(1, puntos.length);
  const gradId = 'dashBarGrad';

  return (
    <DashboardWidgetShell
      titulo={titulo}
      icon="bar_chart"
      editing={editing}
      onRemove={onRemove}
      headerRight={onRango && rango ? (
        <div className={styles.segmentSwitch} role="group" aria-label="Rango del gráfico">
          {(['7d', '1m'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRango(r)}
              className={`${styles.segmentSwitchBtn}${rango === r ? ` ${styles.segmentSwitchBtnOn}` : ''}`}
              aria-pressed={rango === r}
            >
              {r === '7d' ? '7 días' : '1 mes'}
            </button>
          ))}
        </div>
      ) : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 800 }}>
          {Number.isInteger(total) ? total : total.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
        </span>
        {rango ? (
          <span style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
            en {rango === '1m' ? 'el último mes' : 'los últimos 7 días'}
          </span>
        ) : null}
      </div>
      {puntos.length === 0 || total === 0 ? (
        <ErrorState variant="empty" compact title="Sin datos" message="No hay valores en este periodo." />
      ) : (
        <svg
          viewBox={`0 0 ${w} ${chartH + padT + padB}`}
          width="100%"
          height={chartH + padT + padB}
          role="img"
          aria-label={titulo}
          style={{ display: 'block' }}
        >
          {degradado ? (
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--mecanu-electric-600)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--mecanu-electric-600)" stopOpacity="0.25" />
              </linearGradient>
            </defs>
          ) : null}
          <line
            x1={padL}
            y1={padT + chartH}
            x2={w - padL}
            y2={padT + chartH}
            stroke="var(--mecanu-border-subtle)"
            strokeWidth={1}
          />
          {puntos.map((b, i) => {
            const bw = slot * (1 - barGap);
            const x = padL + i * slot + (slot - bw) / 2;
            const bh = Math.max(b.valor > 0 ? 4 : 0, (b.valor / max) * chartH);
            const y = padT + chartH - bh;
            return (
              <g key={`${b.label}-${i}`}>
                <title>{`${b.label}: ${b.valor}`}</title>
                <rect
                  x={x}
                  y={y}
                  width={bw}
                  height={bh}
                  rx={4}
                  fill={degradado ? `url(#${gradId})` : 'var(--mecanu-electric-600)'}
                  className={styles.dashBar}
                />
                <text
                  x={x + bw / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fill="var(--mecanu-text-secondary-light)"
                >
                  {typeof b.valor === 'number' && b.valor >= 100
                    ? b.valor.toLocaleString('es-ES', { maximumFractionDigits: 0 })
                    : b.valor}
                </text>
                <text
                  x={x + bw / 2}
                  y={padT + chartH + 16}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--mecanu-neutral-300)"
                >
                  {b.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </DashboardWidgetShell>
  );
}
