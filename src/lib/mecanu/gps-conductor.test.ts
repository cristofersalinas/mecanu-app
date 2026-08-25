import { describe, expect, it } from 'vitest';
import {
  calloutSeguimiento,
  debeEnviarPing,
  distanciaMetros,
  gpsPosicionEsquemaAusente,
  mensajeErrorGps,
  type GpsPunto,
} from './gps-conductor';

function p(lat: number, lng: number, ts: string): GpsPunto {
  return { lat, lng, accuracy: 10, heading: null, speed: null, ts };
}

describe('gps-conductor', () => {
  it('distanciaMetros ~0 en el mismo punto', () => {
    expect(distanciaMetros({ lat: 41.39, lng: 2.15 }, { lat: 41.39, lng: 2.15 })).toBeLessThan(0.1);
  });

  it('debeEnviarPing si no hay anterior', () => {
    expect(debeEnviarPing(null, p(41.39, 2.15, '2026-01-01T12:00:00.000Z'))).toBe(true);
  });

  it('debeEnviarPing por tiempo', () => {
    const a = p(41.39, 2.15, '2026-01-01T12:00:00.000Z');
    const b = p(41.39, 2.15, '2026-01-01T12:00:25.000Z');
    expect(debeEnviarPing(a, b)).toBe(true);
  });

  it('no envía si poco tiempo y poca distancia', () => {
    const a = p(41.39, 2.15, '2026-01-01T12:00:00.000Z');
    const b = p(41.39001, 2.15, '2026-01-01T12:00:05.000Z');
    expect(debeEnviarPing(a, b)).toBe(false);
  });

  it('mensaje denegado', () => {
    expect(mensajeErrorGps(1)).toMatch(/denegado/i);
  });

  it('callout en tránsito', () => {
    expect(
      calloutSeguimiento({ estadoId: 'en_ruta', subestado: 'en_transito', hayConductor: true }),
    ).toBe('En camino al destino');
  });

  it('esquema GPS incompleto no tumba el ping', () => {
    expect(gpsPosicionEsquemaAusente('Could not find the pos_actualizada_en column')).toBe(true);
    expect(gpsPosicionEsquemaAusente('permission denied')).toBe(false);
  });
});
