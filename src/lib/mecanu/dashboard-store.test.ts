import { describe, expect, it } from 'vitest';
import {
  cargarDashboards,
  duplicarDashboard,
  eliminarDashboard,
  guardarDashboards,
  parseDashboardSnapshot,
  storageKeyDashboards,
  TALLER_ID_DEFAULT,
} from './dashboard-store';

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(initial));
  return {
    get length() { return map.size; },
    clear() { map.clear(); },
    getItem(k: string) { return map.has(k) ? map.get(k)! : null; },
    setItem(k: string, v: string) { map.set(k, v); },
    removeItem(k: string) { map.delete(k); },
    key() { return null; },
  };
}

describe('dashboard-store', () => {
  it('cargar vacío crea plantillas de sistema y last = operacion', () => {
    const snap = cargarDashboards(TALLER_ID_DEFAULT, memoryStorage());
    expect(snap.dashboards.some((d) => d.plantillaId === 'operacion')).toBe(true);
    expect(snap.lastDashboardId).toBe('sys-operacion');
  });

  it('guardar y recargar conserva lastDashboardId', () => {
    const storage = memoryStorage();
    let snap = cargarDashboards('t1', storage);
    snap = { ...snap, lastDashboardId: 'sys-comercial' };
    guardarDashboards(snap, storage);
    const key = storageKeyDashboards('t1');
    expect(storage.getItem(key)).toBeTruthy();
    const again = cargarDashboards('t1', storage);
    expect(again.lastDashboardId).toBe('sys-comercial');
  });

  it('no permite eliminar plantilla sistema', () => {
    const snap = cargarDashboards('t1', memoryStorage());
    const next = eliminarDashboard(snap, 'sys-operacion');
    expect(next.dashboards.find((d) => d.id === 'sys-operacion')).toBeTruthy();
  });

  it('duplicar crea dashboard no-sistema', () => {
    const snap = cargarDashboards('t1', memoryStorage());
    const next = duplicarDashboard(snap, 'sys-operacion', 'Mi operación');
    const copia = next.dashboards.find((d) => d.nombre === 'Mi operación');
    expect(copia?.sistema).toBe(false);
    expect(copia?.widgets.length).toBe(snap.dashboards[0]!.widgets.length);
  });

  it('parse inválido vuelve a default', () => {
    const snap = parseDashboardSnapshot('{no json', 'x');
    expect(snap.dashboards.length).toBeGreaterThanOrEqual(1);
  });
});
