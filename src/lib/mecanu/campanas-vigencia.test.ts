import { describe, expect, it } from 'vitest';
import {
  UMBRAL_CADUCADO_DIAS,
  UMBRAL_POR_VENCER_DIAS,
  UMBRAL_VISIBILIDAD_DIAS,
  comercialBloqueado,
  diasHastaFecha,
  semaforoVigencia,
  visibleEnTabla,
} from './campanas-vigencia';

const hoy = new Date(2026, 7, 18); // 18 ago 2026, local

function dia(offset: number): Date {
  return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + offset);
}

describe('semaforoVigencia', () => {
  it('sin fecha no inventa semáforo', () => {
    expect(semaforoVigencia(null, hoy)).toBeNull();
    expect(semaforoVigencia(undefined, hoy)).toBeNull();
  });

  it('el día de vencimiento (delta 0) ya es vencido', () => {
    expect(semaforoVigencia(dia(0), hoy)).toBe('vencido');
  });

  it('por vencer empieza 45 días antes y vigente queda por encima del umbral', () => {
    expect(UMBRAL_POR_VENCER_DIAS).toBe(45);
    expect(semaforoVigencia(dia(45), hoy)).toBe('por_vencer');
    expect(semaforoVigencia(dia(46), hoy)).toBe('vigente');
  });

  it('el día anterior al vencimiento todavía es por vencer', () => {
    expect(semaforoVigencia(dia(1), hoy)).toBe('por_vencer');
  });

  it('hasta 44 días después es vencido y desde 45 días después es caducado', () => {
    expect(UMBRAL_CADUCADO_DIAS).toBe(45);
    expect(semaforoVigencia(dia(-1), hoy)).toBe('vencido');
    expect(semaforoVigencia(dia(-44), hoy)).toBe('vencido');
    expect(semaforoVigencia(dia(-45), hoy)).toBe('caducado');
  });

  it('ignora la hora del día', () => {
    const tarde = new Date(hoy);
    tarde.setHours(23, 59, 0, 0);
    const fechaMananaManana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1, 0, 1);
    expect(diasHastaFecha(fechaMananaManana, tarde)).toBe(1);
  });
});

describe('visibleEnTabla', () => {
  it('incluye el rango futuro menor de 60 días y excluye el límite', () => {
    expect(UMBRAL_VISIBILIDAD_DIAS).toBe(60);
    expect(visibleEnTabla(dia(59), hoy)).toBe(true);
    expect(visibleEnTabla(dia(60), hoy)).toBe(false);
  });

  it('mantiene vencidos recientes y oculta caducados', () => {
    expect(visibleEnTabla(dia(-44), hoy)).toBe(true);
    expect(visibleEnTabla(dia(-45), hoy)).toBe(false);
  });

  it('sin fecha no aparece en la tabla', () => {
    expect(visibleEnTabla(null, hoy)).toBe(false);
    expect(visibleEnTabla(undefined, hoy)).toBe(false);
  });
});

describe('comercialBloqueado', () => {
  it('solo bloquea el semáforo vigente', () => {
    expect(comercialBloqueado('vigente')).toBe(true);
    expect(comercialBloqueado('por_vencer')).toBe(false);
    expect(comercialBloqueado('vencido')).toBe(false);
    expect(comercialBloqueado('caducado')).toBe(false);
    expect(comercialBloqueado(null)).toBe(false);
  });
});
