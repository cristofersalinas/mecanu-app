import { describe, expect, it } from 'vitest';
import {
  debeCrearOfertaItv, etiquetaCheckinItv, motivoOfertaItv, nivelHallazgoItv, UMBRAL_DIAS_ITV,
} from './oferta-itv';

describe('Oferta de ITV desde el check-in', () => {
  it('sin pegatina (checkbox) → se crea oferta; fecha vacía sin marcar no', () => {
    expect(motivoOfertaItv({ itvSinDato: true, dias: null })).toBe('sin_pegatina');
    expect(motivoOfertaItv({ itvSinDato: false, dias: null })).toBeNull();
    expect(debeCrearOfertaItv({ itvSinDato: true, dias: 200 })).toBe(true);
  });

  it('ITV vencida (no hecha) → se crea oferta', () => {
    expect(motivoOfertaItv({ itvSinDato: false, dias: -1 })).toBe('vencida');
    expect(motivoOfertaItv({ itvSinDato: false, dias: -40 })).toBe('vencida');
  });

  it('por vencer bajo el umbral de 60 días → se crea oferta', () => {
    expect(UMBRAL_DIAS_ITV).toBe(60);
    expect(motivoOfertaItv({ itvSinDato: false, dias: 0 })).toBe('por_vencer');
    expect(motivoOfertaItv({ itvSinDato: false, dias: 59 })).toBe('por_vencer');
  });

  it('vigente a 60 días o más → no se crea', () => {
    expect(motivoOfertaItv({ itvSinDato: false, dias: 60 })).toBeNull();
    expect(motivoOfertaItv({ itvSinDato: false, dias: 200 })).toBeNull();
    expect(debeCrearOfertaItv({ itvSinDato: false, dias: 60 })).toBe(false);
  });

  it('el conductor ve que se crea una oferta, no un tecnicismo interno', () => {
    expect(etiquetaCheckinItv('vencida', -12)).toMatch(/oferta/i);
    expect(etiquetaCheckinItv('sin_pegatina', null)).toMatch(/oferta/i);
    expect(etiquetaCheckinItv(null, 90)).toMatch(/Vigente/);
    expect(nivelHallazgoItv('vencida')).toBe(4);
    expect(nivelHallazgoItv('por_vencer')).toBe(3);
  });
});
