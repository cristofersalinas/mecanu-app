/**
 * Cola local del conductor (P16 v1). Persiste en localStorage.
 * Reintentar envía los mismos ítems; no se empieza de cero.
 */

export const COLA_STORAGE_KEY = 'mecanu.conductor.cola.v1';

export interface ItemColaOffline {
  id: string;
  tipo: string;
  creado: string;
}

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export function leerCola(storage: StorageLike | null | undefined): ItemColaOffline[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(COLA_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed as ItemColaOffline[] : [];
  } catch {
    return [];
  }
}

export function escribirCola(items: ItemColaOffline[], storage: StorageLike | null | undefined): void {
  if (!storage) return;
  if (!items.length) {
    storage.removeItem(COLA_STORAGE_KEY);
    return;
  }
  storage.setItem(COLA_STORAGE_KEY, JSON.stringify(items));
}

export function encolarItem(
  items: ItemColaOffline[],
  tipo: string,
  ahora = new Date(),
): ItemColaOffline[] {
  return [...items, { id: `q-${ahora.getTime()}-${items.length}`, tipo, creado: ahora.toISOString() }];
}

export function vaciarCola(): ItemColaOffline[] {
  return [];
}
