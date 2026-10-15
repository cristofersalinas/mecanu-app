import { describe, expect, it } from 'vitest';
import { at } from './mecanu-data';
import { RUTAS_VISTA } from './mecanu-rutas';
import {
  crecimiento7d,
  resolverMetrica,
  resolverParaViz,
  type DashboardDatosCtx,
} from './dashboard-metricas';
import type { Campana } from './types';

function ctxBase(partial?: Partial<DashboardDatosCtx>): DashboardDatosCtx {
  return {
    rutas: RUTAS_VISTA,
    campanas: [],
    pipelineTareas: { pendiente: [], hecho: [], cancelado: [] },
    conductores: [],
    ahora: at(12, 0, 0),
    rangoSerie: '7d',
    ...partial,
  };
}

describe('dashboard-metricas repositorio', () => {
  it('origen_campanas reparte automática vs manual', () => {
    const campanas = [
      { origenAutomatico: true, fecha: at(12, 0, 0), estado: 'nueva', tipos: ['aceite'] },
      { origenAutomatico: false, fecha: at(12, 0, 0), estado: 'enviada', tipos: ['frenos'] },
      { origenAutomatico: true, fecha: at(12, 0, 0), estado: 'aceptada', tipos: ['aceite'] },
    ] as unknown as Campana[];
    const r = resolverMetrica('origen_campanas', ctxBase({ campanas }));
    expect(r.kind).toBe('donut');
    if (r.kind !== 'donut') return;
    expect(r.slices.find((s) => s.label === 'Automática')?.valor).toBe(2);
    expect(r.slices.find((s) => s.label === 'Manual')?.valor).toBe(1);
  });

  it('resolverParaViz convierte reparto a barras', () => {
    const campanas = [
      { origenAutomatico: true, fecha: at(12, 0, 0), estado: 'nueva', tipos: [] },
      { origenAutomatico: false, fecha: at(12, 0, 0), estado: 'nueva', tipos: [] },
    ] as unknown as Campana[];
    const r = resolverParaViz('origen_campanas', 'barras', ctxBase({ campanas }));
    expect(r.kind).toBe('serie');
    if (r.kind !== 'serie') return;
    expect(r.puntos.length).toBe(2);
  });

  it('serie_campanas cuenta por día', () => {
    const ahora = at(12, 0, 0);
    const campanas = [
      { origenAutomatico: false, fecha: ahora, estado: 'nueva', tipos: [] },
      { origenAutomatico: false, fecha: new Date(ahora.getTime() - 86400000), estado: 'nueva', tipos: [] },
    ] as unknown as Campana[];
    const r = resolverMetrica('serie_campanas', ctxBase({ campanas, ahora }));
    expect(r.kind).toBe('serie');
    if (r.kind !== 'serie') return;
    expect(r.total).toBe(2);
  });

  it('crecimiento7d detecta subida', () => {
    const ahora = at(12, 0, 0);
    const fechas = [
      new Date(ahora.getTime() - 2 * 86400000),
      new Date(ahora.getTime() - 1 * 86400000),
      new Date(ahora.getTime() - 10 * 86400000),
    ];
    const g = crecimiento7d(fechas, ahora);
    expect(g.dir).toBe('up');
    expect(g.delta).toBe('1');
  });
});
