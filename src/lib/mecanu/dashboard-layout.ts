/**
 * Helpers de layout: snap, colisión, clamp a límites del catálogo.
 */
import { limitesDeWidget } from './dashboard-catalogo';
import type {
  DashboardLayout,
  DashboardWidget,
  WidgetLimites,
  WidgetTipo,
} from './dashboard-types';
import { GRID_COLS } from './dashboard-types';
import { conteoItemsGrupo, minHGrupo } from './dashboard-widget-layout';

/** Límites del catálogo + minH dinámico según columnas del grupo. */
export function limitesEfectivos(
  metricaId: string,
  tipo: WidgetTipo | undefined,
  layoutW: number,
): WidgetLimites {
  const base = limitesDeWidget(metricaId, tipo);
  const n = conteoItemsGrupo(metricaId);
  if (n == null) return base;
  const minH = minHGrupo(n, layoutW);
  return { ...base, minH: Math.max(base.minH, minH) };
}

export function layoutsSolapan(a: DashboardLayout, b: DashboardLayout): boolean {
  return !(
    a.x + a.w <= b.x
    || b.x + b.w <= a.x
    || a.y + a.h <= b.y
    || b.y + b.h <= a.y
  );
}

export function clampLayout(
  layout: DashboardLayout,
  limites: WidgetLimites,
  cols = GRID_COLS,
): DashboardLayout {
  let w = Math.min(limites.maxW, Math.max(limites.minW, layout.w));
  let h = Math.min(limites.maxH, Math.max(limites.minH, layout.h));

  if (limites.minRatio != null && limites.minRatio > 0 && h > 0) {
    const ratio = w / h;
    if (ratio < limites.minRatio) {
      const wNecesario = Math.ceil(h * limites.minRatio);
      if (wNecesario <= limites.maxW && wNecesario <= cols) {
        w = Math.max(w, Math.min(limites.maxW, wNecesario));
      } else {
        const hMaxPorRatio = Math.floor(w / limites.minRatio);
        h = Math.min(h, Math.max(limites.minH, hMaxPorRatio));
      }
    }
  }

  w = Math.min(w, cols);
  h = Math.min(limites.maxH, Math.max(limites.minH, h));

  const x = Math.max(0, Math.min(layout.x, cols - w));
  const y = Math.max(0, layout.y);

  return { x, y, w, h };
}

export function clampWidgetLayout(widget: DashboardWidget, cols = GRID_COLS): DashboardLayout {
  const lim1 = limitesEfectivos(widget.metricaId, widget.tipo, widget.layout.w);
  const mid = clampLayout(widget.layout, lim1, cols);
  const lim2 = limitesEfectivos(widget.metricaId, widget.tipo, mid.w);
  return clampLayout(mid, lim2, cols);
}

/** Aplica clamp a todos los widgets (p. ej. tras cargar de storage). */
export function clampDashboardWidgets(widgets: DashboardWidget[]): DashboardWidget[] {
  return widgets.map((w) => ({ ...w, layout: clampWidgetLayout(w) }));
}

export function hayColision(
  layout: DashboardLayout,
  widgets: readonly DashboardWidget[],
  exceptId?: string,
): boolean {
  return widgets.some((w) => w.id !== exceptId && layoutsSolapan(layout, w.layout));
}

/**
 * Busca el primer hueco libre de tamaño w×h (barrido fila a fila).
 * Si no cabe sin solape, coloca al final (maxY).
 */
export function primerHuecoLibre(
  widgets: readonly DashboardWidget[],
  size: { w: number; h: number },
  cols = GRID_COLS,
): DashboardLayout {
  const w = Math.min(size.w, cols);
  const h = size.h;
  const maxY = widgets.reduce((m, x) => Math.max(m, x.layout.y + x.layout.h), 0) + 40;

  for (let y = 0; y <= maxY; y++) {
    for (let x = 0; x <= cols - w; x++) {
      const candidate = { x, y, w, h };
      if (!hayColision(candidate, widgets)) return candidate;
    }
  }
  return { x: 0, y: maxY, w, h };
}

/** Mueve un widget; si choca, busca el hueco más cercano hacia abajo en la misma columna. */
export function moverSinSolape(
  widgets: readonly DashboardWidget[],
  widgetId: string,
  destino: { x: number; y: number },
): DashboardWidget[] {
  const target = widgets.find((w) => w.id === widgetId);
  if (!target) return [...widgets];

  let layout = clampLayout(
    { ...target.layout, x: destino.x, y: destino.y },
    limitesEfectivos(target.metricaId, target.tipo, target.layout.w),
  );
  layout = clampLayout(layout, limitesEfectivos(target.metricaId, target.tipo, layout.w));

  if (hayColision(layout, widgets, widgetId)) {
    layout = primerHuecoLibre(
      widgets.filter((w) => w.id !== widgetId),
      { w: layout.w, h: layout.h },
    );
    layout = clampLayout(
      { ...layout, x: Math.min(destino.x, GRID_COLS - layout.w), y: layout.y },
      limitesEfectivos(target.metricaId, target.tipo, layout.w),
    );
    if (hayColision(layout, widgets, widgetId)) {
      const maxY = widgets
        .filter((w) => w.id !== widgetId)
        .reduce((m, x) => Math.max(m, x.layout.y + x.layout.h), 0);
      layout = clampLayout(
        { x: destino.x, y: maxY, w: layout.w, h: layout.h },
        limitesEfectivos(target.metricaId, target.tipo, layout.w),
      );
    }
  }

  return widgets.map((w) => (w.id === widgetId ? { ...w, layout } : w));
}

export function redimensionarSinSolape(
  widgets: readonly DashboardWidget[],
  widgetId: string,
  size: { w: number; h: number },
): DashboardWidget[] {
  const target = widgets.find((w) => w.id === widgetId);
  if (!target) return [...widgets];

  const proposed = { ...target.layout, w: size.w, h: size.h };
  let layout = clampLayout(proposed, limitesEfectivos(target.metricaId, target.tipo, size.w));
  layout = clampLayout(layout, limitesEfectivos(target.metricaId, target.tipo, layout.w));

  if (hayColision(layout, widgets, widgetId)) {
    const limMin = limitesEfectivos(target.metricaId, target.tipo, layout.w);
    for (let h = layout.h; h >= limMin.minH; h--) {
      for (let w = layout.w; w >= limMin.minW; w--) {
        const limW = limitesEfectivos(target.metricaId, target.tipo, w);
        const cand = clampLayout({ ...target.layout, w, h }, limW);
        if (!hayColision(cand, widgets, widgetId)) {
          return widgets.map((x) => (x.id === widgetId ? { ...x, layout: cand } : x));
        }
      }
    }
    return [...widgets];
  }

  return widgets.map((w) => (w.id === widgetId ? { ...w, layout } : w));
}

export function snapCoord(valor: number, cell: number): number {
  if (cell <= 0) return Math.round(valor);
  return Math.round(valor / cell) * cell;
}

export function validarLayoutsSinSolape(widgets: readonly DashboardWidget[]): boolean {
  for (let i = 0; i < widgets.length; i++) {
    for (let j = i + 1; j < widgets.length; j++) {
      if (layoutsSolapan(widgets[i]!.layout, widgets[j]!.layout)) return false;
    }
  }
  return true;
}
