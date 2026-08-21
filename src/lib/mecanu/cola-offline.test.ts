import { describe, expect, it } from 'vitest';
import { COLA_STORAGE_KEY, encolarItem, escribirCola, leerCola, vaciarCola } from './cola-offline';

function memoria(): { store: Record<string, string>; api: Storage } {
  const store: Record<string, string> = {};
  return {
    store,
    api: {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      length: 0,
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
      key: () => null,
    },
  };
}

describe('Cola offline del conductor', () => {
  it('encola, persiste y se vacía al reintentar', () => {
    const { store, api } = memoria();
    let cola = encolarItem([], 'checkin', new Date('2026-08-20T10:00:00Z'));
    cola = encolarItem(cola, 'foto', new Date('2026-08-20T10:01:00Z'));
    escribirCola(cola, api);
    expect(store[COLA_STORAGE_KEY]).toBeTruthy();
    expect(leerCola(api)).toHaveLength(2);
    escribirCola(vaciarCola(), api);
    expect(leerCola(api)).toEqual([]);
  });

  it('un JSON roto no tira la app', () => {
    const { api } = memoria();
    api.setItem(COLA_STORAGE_KEY, '{no');
    expect(leerCola(api)).toEqual([]);
  });
});
