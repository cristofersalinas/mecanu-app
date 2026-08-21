import { describe, expect, it } from 'vitest';
import { docsCompletos, puedeTomarBolsa, transicionarProceso } from './ciclo-conductor';
import type { Conductor } from '../types';

function cond(over: Partial<Conductor> = {}): Conductor {
  return {
    id: 'd9',
    nombre: 'Nuevo',
    telefono: '600 000 000',
    red: 'Interna',
    furgoneta: '—',
    proceso: 'documentos_pendientes',
    supervisados: 0,
    requeridos: 3,
    alta: new Date('2026-07-01'),
    calificacion: 0,
    valoraciones: 0,
    docs: { dni: false, carnet: false, iban: false, seguro: false },
    incidencias: [],
    ...over,
  };
}

describe('Onboarding del conductor', () => {
  it('sin los 4 documentos no pasa a supervisión', () => {
    const c = cond({ docs: { dni: true, carnet: true, iban: true, seguro: false } });
    expect(docsCompletos(c.docs)).toBe(false);
    expect(() => transicionarProceso(c, 'en_supervision')).toThrow(/documentos/);
  });

  it('con documentos pasa a supervisión y no puede activarse hasta completar los servicios', () => {
    const c = cond({ docs: { dni: true, carnet: true, iban: true, seguro: true } });
    transicionarProceso(c, 'en_supervision');
    expect(c.proceso).toBe('en_supervision');
    expect(() => transicionarProceso(c, 'activo')).toThrow(/supervisados/);
    c.supervisados = 3;
    transicionarProceso(c, 'activo');
    expect(c.proceso).toBe('activo');
    expect(puedeTomarBolsa(c)).toBe(true);
  });

  it('no se salta la supervisión', () => {
    const c = cond({ docs: { dni: true, carnet: true, iban: true, seguro: true } });
    expect(() => transicionarProceso(c, 'activo')).toThrow(/supervisión/);
  });

  it('el onboarding no retrocede a documentos', () => {
    const c = cond({ proceso: 'activo', docs: { dni: true, carnet: true, iban: true, seguro: true }, supervisados: 3 });
    expect(() => transicionarProceso(c, 'documentos_pendientes')).toThrow(/no retrocede/);
  });

  it('en documentos pendientes no puede tomar de la bolsa', () => {
    expect(puedeTomarBolsa(cond())).toBe(false);
  });
});
