import { describe, expect, it } from 'vitest';
import { coordsDesdeCatalogo } from './geocode';

describe('geocode catalogo', () => {
  it('resuelve el taller seed', () => {
    const c = coordsDesdeCatalogo('Carrer de Numància 105, Nau 3, 08029 Barcelona');
    expect(c).toEqual({ lat: 41.3836, lng: 2.1381 });
  });

  it('null si no hay dirección', () => {
    expect(coordsDesdeCatalogo(null)).toBeNull();
    expect(coordsDesdeCatalogo('Calle inventada 999, Mordor')).toBeNull();
  });
});
