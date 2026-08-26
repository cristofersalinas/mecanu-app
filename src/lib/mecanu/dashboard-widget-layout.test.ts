import { describe, expect, it } from 'vitest';
import {
  columnasGrupo,
  divisoresDe,
  minHGrupo,
} from './dashboard-widget-layout';

describe('dashboard-widget-layout', () => {
  it('divisoresDe de 4 son 1, 2 y 4', () => {
    expect(divisoresDe(4)).toEqual([1, 2, 4]);
  });

  it('4 métricas: solo 1×4, 2×2 o 4×1 según ancho', () => {
    expect(columnasGrupo(4, 12)).toBe(4);
    expect(columnasGrupo(4, 10)).toBe(4);
    expect(columnasGrupo(4, 8)).toBe(2);
    expect(columnasGrupo(4, 6)).toBe(2);
    expect(columnasGrupo(4, 4)).toBe(1);
  });

  it('5 métricas: solo 1×5 o 5×1 (sin 3+2)', () => {
    expect(columnasGrupo(5, 12)).toBe(5);
    expect(columnasGrupo(5, 8)).toBe(1);
    expect(columnasGrupo(5, 4)).toBe(1);
  });

  it('minH crece al apilar (4×1 > 2×2 > 1×4)', () => {
    const hAncho = minHGrupo(4, 12);
    const hMedio = minHGrupo(4, 8);
    const hEstrecho = minHGrupo(4, 4);
    expect(hEstrecho).toBeGreaterThan(hMedio);
    expect(hMedio).toBeGreaterThan(hAncho);
  });
});
