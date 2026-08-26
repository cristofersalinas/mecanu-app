import { describe, expect, it } from 'vitest';
import {
  dashboardDesdePlantilla,
  plantillaIncluyeHeroOperacion,
  widgetsPlantillaOperacion,
} from './dashboard-plantillas';

describe('dashboard-plantillas', () => {
  it('operacion incluye citas + mapa + kpis arriba', () => {
    const widgets = widgetsPlantillaOperacion();
    expect(plantillaIncluyeHeroOperacion(widgets)).toBe(true);
    const citas = widgets.find((w) => w.tipo === 'proximas_citas');
    const mapa = widgets.find((w) => w.tipo === 'flota_mapa');
    const kpis = widgets.find((w) => w.tipo === 'kpis_generales');
    expect(citas?.layout.w).toBe(4);
    expect(mapa?.layout.w).toBe(8);
    expect(kpis?.layout.y).toBe(0);
    expect(citas?.layout.y).toBe(kpis!.layout.y + kpis!.layout.h);
    expect(mapa?.layout.y).toBe(citas?.layout.y);
  });

  it('dashboardDesdePlantilla marca sistema', () => {
    const d = dashboardDesdePlantilla('operacion');
    expect(d.sistema).toBe(true);
    expect(d.plantillaId).toBe('operacion');
    expect(d.widgets.length).toBeGreaterThan(5);
  });
});
