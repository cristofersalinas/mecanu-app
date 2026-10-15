import { describe, expect, it } from 'vitest';
import {
  CICLO_VIDA_LABEL,
  cicloVidaCliente,
  digitosTelefonoClave,
  telefonosCoinciden,
} from './cliente-ciclo-vida';

describe('cicloVidaCliente', () => {
  const ahora = new Date('2026-08-23T12:00:00Z');

  it('prospecto si no está en BD', () => {
    expect(
      cicloVidaCliente({
        registrado: false,
        ordenesCompletadas: 5,
        ultimaOrdenEn: ahora,
        ahora,
      }),
    ).toBe('prospecto');
  });

  it('registrado sin órdenes', () => {
    expect(
      cicloVidaCliente({
        registrado: true,
        ordenesCompletadas: 0,
        ultimaOrdenEn: null,
        ahora,
      }),
    ).toBe('registrado');
  });

  it('nuevo / recompra / fidelizado por volumen', () => {
    expect(
      cicloVidaCliente({
        registrado: true,
        ordenesCompletadas: 1,
        ultimaOrdenEn: ahora,
        ahora,
      }),
    ).toBe('nuevo');
    expect(
      cicloVidaCliente({
        registrado: true,
        ordenesCompletadas: 2,
        ultimaOrdenEn: ahora,
        ahora,
      }),
    ).toBe('recompra');
    expect(
      cicloVidaCliente({
        registrado: true,
        ordenesCompletadas: 3,
        ultimaOrdenEn: ahora,
        ahora,
      }),
    ).toBe('fidelizado');
  });

  it('en riesgo y perdido por recencia (ganan a volumen)', () => {
    const hace14m = new Date('2025-06-01T12:00:00Z');
    const hace21m = new Date('2024-11-01T12:00:00Z');
    expect(
      cicloVidaCliente({
        registrado: true,
        ordenesCompletadas: 5,
        ultimaOrdenEn: hace14m,
        ahora,
      }),
    ).toBe('en_riesgo');
    expect(
      cicloVidaCliente({
        registrado: true,
        ordenesCompletadas: 5,
        ultimaOrdenEn: hace21m,
        ahora,
      }),
    ).toBe('perdido');
  });

  it('etiquetas y match de teléfono', () => {
    expect(CICLO_VIDA_LABEL.fidelizado).toBe('Fidelizado');
    expect(digitosTelefonoClave('+34 655 111 222')).toBe('655111222');
    expect(telefonosCoinciden('34655111222', '655 111 222')).toBe(true);
    expect(telefonosCoinciden('56945088077', '655111222')).toBe(false);
  });
});
