import { describe, expect, it } from 'vitest';
import {
  clampLayout,
  hayColision,
  layoutsSolapan,
  limitesEfectivos,
  moverSinSolape,
  primerHuecoLibre,
  redimensionarSinSolape,
  validarLayoutsSinSolape,
} from './dashboard-layout';
import { limitesDeWidget } from './dashboard-catalogo';
import type { DashboardWidget } from './dashboard-types';

function widget(
  id: string,
  layout: DashboardWidget['layout'],
  metricaId = 'traslados_hoy',
  tipo: DashboardWidget['tipo'] = 'metrica',
): DashboardWidget {
  return { id, metricaId, tipo, viz: 'numero', layout };
}

describe('dashboard-layout', () => {
  it('clampLayout respeta min del mapa de flota', () => {
    const lim = limitesDeWidget('flota_mapa');
    const out = clampLayout({ x: 0, y: 0, w: 3, h: 4 }, lim);
    expect(out.w).toBeGreaterThanOrEqual(lim.minW);
    expect(out.h).toBeGreaterThanOrEqual(lim.minH);
    expect(out.w).toBeGreaterThanOrEqual(6);
    expect(out.h).toBeGreaterThanOrEqual(10);
  });

  it('clampLayout no deja w fuera de la grid', () => {
    const lim = limitesDeWidget('kpis_generales');
    const out = clampLayout({ x: 10, y: 0, w: 12, h: 4 }, lim);
    expect(out.x + out.w).toBeLessThanOrEqual(12);
  });

  it('limitesEfectivos sube minH al estrechar un grupo de 4', () => {
    const ancho = limitesEfectivos('kpis_traslados', 'kpis_traslados', 12);
    const estrecho = limitesEfectivos('kpis_traslados', 'kpis_traslados', 4);
    expect(estrecho.minH).toBeGreaterThan(ancho.minH);
  });

  it('redimensionarSinSolape no deja h bajo el min efectivo del grupo', () => {
    const widgets = [widget('a', { x: 0, y: 0, w: 12, h: 5 }, 'kpis_traslados', 'kpis_traslados')];
    const next = redimensionarSinSolape(widgets, 'a', { w: 4, h: 2 });
    const lim = limitesEfectivos('kpis_traslados', 'kpis_traslados', next[0]!.layout.w);
    expect(next[0]!.layout.h).toBeGreaterThanOrEqual(lim.minH);
    expect(next[0]!.layout.w).toBeGreaterThanOrEqual(lim.minW);
  });

  it('layoutsSolapan detecta solape', () => {
    expect(layoutsSolapan(
      { x: 0, y: 0, w: 4, h: 4 },
      { x: 3, y: 2, w: 4, h: 4 },
    )).toBe(true);
    expect(layoutsSolapan(
      { x: 0, y: 0, w: 4, h: 4 },
      { x: 4, y: 0, w: 4, h: 4 },
    )).toBe(false);
  });

  it('primerHuecoLibre evita colisiones', () => {
    const widgets = [widget('a', { x: 0, y: 0, w: 6, h: 4 })];
    const hueco = primerHuecoLibre(widgets, { w: 6, h: 4 });
    expect(hayColision(hueco, widgets)).toBe(false);
  });

  it('moverSinSolape no deja solapes', () => {
    const widgets = [
      widget('a', { x: 0, y: 0, w: 4, h: 3 }),
      widget('b', { x: 4, y: 0, w: 4, h: 3 }),
    ];
    const next = moverSinSolape(widgets, 'b', { x: 0, y: 0 });
    expect(validarLayoutsSinSolape(next)).toBe(true);
  });

  it('redimensionarSinSolape clampa KPI a maxW', () => {
    const widgets = [widget('a', { x: 0, y: 0, w: 2, h: 2 }, 'traslados_hoy')];
    const next = redimensionarSinSolape(widgets, 'a', { w: 10, h: 2 });
    expect(next[0]!.layout.w).toBeLessThanOrEqual(4);
  });
});
