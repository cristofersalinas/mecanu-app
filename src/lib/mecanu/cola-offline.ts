/**
 * Cola local del conductor (P16). IndexedDB en el navegador; localStorage / memoria
 * como fallback (tests y entornos sin IDB). Reintentar envía los mismos ítems.
 */
export const COLA_STORAGE_KEY = 'mecanu.conductor.cola.v1';
export const COLA_IDB_NAME = 'mecanu.conductor';
export const COLA_IDB_STORE = 'cola';

export interface ItemColaOffline {
  id: string;
  tipo: string;
  creado: string;
  /** Cuerpo a reenviar al API (misma tarea). */
  payload?: unknown;
  idempotencyKey?: string;
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
  extra?: { payload?: unknown; idempotencyKey?: string },
): ItemColaOffline[] {
  return [
    ...items,
    {
      id: `q-${ahora.getTime()}-${items.length}`,
      tipo,
      creado: ahora.toISOString(),
      payload: extra?.payload,
      idempotencyKey: extra?.idempotencyKey,
    },
  ];
}

export function vaciarCola(): ItemColaOffline[] {
  return [];
}

function openIdb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(COLA_IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(COLA_IDB_STORE)) {
          db.createObjectStore(COLA_IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** Lee la cola desde IndexedDB; si falla, localStorage. */
export async function leerColaAsync(
  storage?: StorageLike | null,
): Promise<ItemColaOffline[]> {
  const db = await openIdb();
  if (db) {
    try {
      const items = await new Promise<ItemColaOffline[] | null>((resolve) => {
        const tx = db.transaction(COLA_IDB_STORE, 'readonly');
        const store = tx.objectStore(COLA_IDB_STORE);
        const req = store.get(COLA_STORAGE_KEY);
        req.onsuccess = () => {
          const v = req.result;
          resolve(Array.isArray(v) ? v as ItemColaOffline[] : null);
        };
        req.onerror = () => resolve(null);
      });
      db.close();
      if (items) return items;
    } catch {
      try { db.close(); } catch { /* ignore */ }
    }
  }
  const st = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  return leerCola(st);
}

/** Persiste en IndexedDB y espejo en localStorage. */
export async function escribirColaAsync(
  items: ItemColaOffline[],
  storage?: StorageLike | null,
): Promise<void> {
  const st = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  escribirCola(items, st);
  const db = await openIdb();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(COLA_IDB_STORE, 'readwrite');
      const store = tx.objectStore(COLA_IDB_STORE);
      if (!items.length) store.delete(COLA_STORAGE_KEY);
      else store.put(items, COLA_STORAGE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    try { db.close(); } catch { /* ignore */ }
  }
}
