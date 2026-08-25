import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PANEL_REALTIME_POLL_MS,
  PANEL_SNAPSHOT_POLL_MS,
  cambioRutaAfectaKanban,
  crearRefrescoDebounced,
  tallerIdDesdeAppMetadata,
} from './panel-realtime';

describe('cambioRutaAfectaKanban', () => {
  it('INSERT y DELETE siempre refrescan', () => {
    expect(cambioRutaAfectaKanban({ eventType: 'INSERT' })).toBe(true);
    expect(cambioRutaAfectaKanban({ eventType: 'DELETE' })).toBe(true);
  });

  it('UPDATE sin old (replica identity default) refresca', () => {
    expect(cambioRutaAfectaKanban({
      eventType: 'UPDATE',
      newRow: { estado: 'en_ruta', subestado: 'en_camino_origen' },
    })).toBe(true);
  });

  it('UPDATE de estado o subestado refresca', () => {
    expect(cambioRutaAfectaKanban({
      eventType: 'UPDATE',
      oldRow: { estado: 'agendado', subestado: 'asignado' },
      newRow: { estado: 'en_ruta', subestado: 'en_camino_origen' },
    })).toBe(true);
  });

  it('UPDATE de otro campo no refresca si old trae estado', () => {
    expect(cambioRutaAfectaKanban({
      eventType: 'UPDATE',
      oldRow: { estado: 'agendado', subestado: 'asignado' },
      newRow: { estado: 'agendado', subestado: 'asignado' },
    })).toBe(false);
  });
});

describe('tallerIdDesdeAppMetadata', () => {
  it('lee taller_id de app_metadata', () => {
    expect(tallerIdDesdeAppMetadata({ taller_id: 'taller-rodriguez' })).toBe('taller-rodriguez');
    expect(tallerIdDesdeAppMetadata({})).toBeNull();
    expect(tallerIdDesdeAppMetadata(null)).toBeNull();
  });
});

describe('crearRefrescoDebounced', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('agrupa pings en una sola llamada', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = crearRefrescoDebounced(fn, 400);
    d.ping();
    d.ping();
    vi.advanceTimersByTime(399);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    d.cancel();
  });
});

describe('poll de respaldo del kanban', () => {
  it('el poll ligero es corto; el snapshot completo no satura', () => {
    expect(PANEL_REALTIME_POLL_MS).toBeLessThanOrEqual(2_500);
    expect(PANEL_REALTIME_POLL_MS).toBeGreaterThan(0);
    expect(PANEL_SNAPSHOT_POLL_MS).toBeGreaterThan(PANEL_REALTIME_POLL_MS);
  });
});
