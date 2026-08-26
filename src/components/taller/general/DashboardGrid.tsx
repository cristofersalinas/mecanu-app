'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { GRID_COLS, GRID_GAP_PX, GRID_ROW_PX, type DashboardWidget } from '@/lib/mecanu/dashboard-types';
import { moverSinSolape, redimensionarSinSolape } from '@/lib/mecanu/dashboard-layout';
import styles from '../panel.module.css';

export function DashboardGrid({
  widgets,
  editing,
  onWidgetsChange,
  renderWidget,
}: {
  widgets: DashboardWidget[];
  editing: boolean;
  onWidgetsChange: (next: DashboardWidget[]) => void;
  renderWidget: (w: DashboardWidget) => ReactNode;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const widgetsRef = useRef(widgets);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    widgetsRef.current = widgets;
  }, [widgets]);

  const maxRow = widgets.reduce((m, w) => Math.max(m, w.layout.y + w.layout.h), 8);

  const cellFromPointer = (clientX: number, clientY: number) => {
    const el = gridRef.current;
    if (!el) return { col: 0, row: 0 };
    const rect = el.getBoundingClientRect();
    const colW = (rect.width - GRID_GAP_PX * (GRID_COLS - 1)) / GRID_COLS;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const col = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(x / (colW + GRID_GAP_PX))));
    const row = Math.max(0, Math.floor(y / (GRID_ROW_PX + GRID_GAP_PX)));
    return { col, row };
  };

  const onPointerDownDrag = (e: React.PointerEvent, widgetId: string) => {
    if (!editing) return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(widgetId);
    const base = widgetsRef.current;
    const target = base.find((w) => w.id === widgetId);
    if (!target) return;
    const start = cellFromPointer(e.clientX, e.clientY);
    const ox = start.col - target.layout.x;
    const oy = start.row - target.layout.y;

    const onMove = (ev: PointerEvent) => {
      const cur = cellFromPointer(ev.clientX, ev.clientY);
      const nx = Math.max(0, cur.col - ox);
      const ny = Math.max(0, cur.row - oy);
      onWidgetsChange(moverSinSolape(base, widgetId, { x: nx, y: ny }));
    };
    const onUp = () => {
      setDragging(null);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const onPointerDownResize = (e: React.PointerEvent, widgetId: string) => {
    if (!editing) return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(widgetId);
    const base = widgetsRef.current;
    const target = base.find((w) => w.id === widgetId);
    if (!target) return;

    const onMove = (ev: PointerEvent) => {
      const cur = cellFromPointer(ev.clientX, ev.clientY);
      const ww = Math.max(1, cur.col - target.layout.x + 1);
      const hh = Math.max(1, cur.row - target.layout.y + 1);
      onWidgetsChange(redimensionarSinSolape(widgetsRef.current, widgetId, { w: ww, h: hh }));
    };
    const onUp = () => {
      setDragging(null);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      ref={gridRef}
      className={`${styles.dashGrid}${editing ? ` ${styles.dashGridEdit}` : ''}`}
      style={{
        gridTemplateRows: `repeat(${maxRow}, ${GRID_ROW_PX}px)`,
        minHeight: maxRow * (GRID_ROW_PX + GRID_GAP_PX),
      }}
    >
      {widgets.map((w) => (
        <div
          key={w.id}
          className={`${styles.dashGridItem}${dragging === w.id ? ` ${styles.dashGridItemActive}` : ''}`}
          style={{
            gridColumn: `${w.layout.x + 1} / span ${w.layout.w}`,
            gridRow: `${w.layout.y + 1} / span ${w.layout.h}`,
          }}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('[data-dash-resize]')) {
              onPointerDownResize(e, w.id);
            } else if ((e.target as HTMLElement).closest('[data-dash-drag]')) {
              onPointerDownDrag(e, w.id);
            }
          }}
        >
          {renderWidget(w)}
        </div>
      ))}
    </div>
  );
}
