import { describe, it, expect } from 'vitest';
import { construirEnvioWa, esBaja, telefonoClienteCampana } from './whatsapp-service';
import type { Campana, CanalWa } from './types';
import { CAMPANAS } from './mecanu-rutas';

const campanaBase = CAMPANAS.find((c) => c.id === 'OP-3001') as Campana;
const canalIn: CanalWa = { optIn: 'IN', mensajes: [] };

describe('construirEnvioWa', () => {
  it('construye recordatorio con hallazgos marcados', () => {
    const itemId = campanaBase.items[0]?.id;
    expect(itemId).toBeTruthy();
    const { cuerpo, payload, tipoMensaje } = construirEnvioWa(
      campanaBase,
      canalIn,
      { campanaId: 'OP-3001', tipo: 'recordatorio', seleccion: [itemId!] },
      '34600111222',
    );
    expect(tipoMensaje).toBe('recordatorio');
    expect(cuerpo.length).toBeGreaterThan(10);
    expect(payload.to).toBe('34600111222');
  });

  it('rechaza opt-out', () => {
    expect(() => construirEnvioWa(
      campanaBase,
      { optIn: 'OUT', mensajes: [] },
      { campanaId: 'OP-3001', tipo: 'text', seleccion: [], cuerpo: 'Hola' },
      '34600111222',
    )).toThrow(/baja/i);
  });
});

describe('esBaja', () => {
  it('detecta BAJA', () => {
    expect(esBaja('BAJA')).toBe(true);
    expect(esBaja('baja por favor')).toBe(true);
    expect(esBaja('SÍ')).toBe(false);
  });
});

describe('telefonoClienteCampana', () => {
  it('formatea teléfono del cliente sembrado', () => {
    const tel = telefonoClienteCampana(campanaBase);
    expect(tel).toMatch(/^34\d+$/);
  });
});
