import { describe, expect, it } from 'vitest';
import {
  titulosWikipediaVehiculo, urlFotoVehiculo,
} from './foto-vehiculo';

describe('titulosWikipediaVehiculo', () => {
  it('mapea Clase / Serie y genéricos', () => {
    expect(titulosWikipediaVehiculo('Mercedes-Benz', 'Clase A')[0]).toMatch(/A-Class/);
    expect(titulosWikipediaVehiculo('BMW', 'Serie 1')).toContain('BMW_1_Series');
    expect(titulosWikipediaVehiculo('Toyota', 'Corolla')).toContain('Toyota_Corolla');
  });
});

describe('urlFotoVehiculo', () => {
  it('arma proxy same-origin (CSP)', () => {
    const url = urlFotoVehiculo({ marca: 'Toyota', modelo: 'Corolla' });
    expect(url).toBe('/api/v1/vehicle-photo?marca=Toyota&modelo=Corolla&v=wiki2');
  });

  it('null sin marca o modelo', () => {
    expect(urlFotoVehiculo({ marca: 'Toyota', modelo: null })).toBeNull();
    expect(urlFotoVehiculo({ marca: '', modelo: 'Golf' })).toBeNull();
  });
});
