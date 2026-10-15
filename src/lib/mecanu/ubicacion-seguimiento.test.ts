import { describe, expect, it } from 'vitest';
import { construirUbicacionSeguimiento } from './ubicacion-seguimiento';
import type { Parada, RutaVista, Tramo } from './types';

function ruta(partial: Partial<RutaVista> & Pick<RutaVista, 'id' | 'estado' | 'subestado'>): RutaVista {
  return {
    vehiculoId: null,
    clienteId: null,
    perfilServicio: '',
    modeloPrecio: 'taller',
    precioTotal: 0,
    tagsManual: [],
    clienteTieneAuto: null,
    vehiculoListo: null,
    campanaOrigenId: null,
    presupuestoId: '',
    motivo: null,
    canceladaEn: null,
    incidencia: null,
    matriculaLead: null,
    linkToken: 'tok-demo',
    linkEnviadoEn: null,
    creadaEn: new Date(),
    descripcionServicio: '',
    seguro: true,
    tramoActivoId: null,
    etiquetaOrigen: 'Casa',
    etiquetaDestino: 'Taller',
    direccionOrigen: null,
    direccionDestino: null,
    paradaOrigen: null,
    paradaDestino: null,
    presupuesto: null,
    ...partial,
  } as RutaVista;
}

describe('construirUbicacionSeguimiento', () => {
  it('oculta conductor si no está EN RUTA', () => {
    const u = construirUbicacionSeguimiento({
      token: 'tok-demo',
      ruta: ruta({ id: 'TR-1', estado: 'agendado', subestado: 'confirmado' }),
      tramo: {
        id: 'TS-1',
        posLat: 41.39,
        posLng: 2.15,
        posActualizadaEn: new Date(),
      } as Tramo,
      origen: null,
      destino: { id: 'PD-1', lat: 41.38, lng: 2.13, etiqueta: 'Taller' } as Parada,
    });
    expect(u.visible).toBe(false);
    expect(u.conductor).toBeNull();
    expect(u.destino?.lat).toBe(41.38);
  });

  it('muestra conductor en EN RUTA', () => {
    const u = construirUbicacionSeguimiento({
      token: 'tok-demo',
      ruta: ruta({ id: 'TR-1', estado: 'en_ruta', subestado: 'en_transito' }),
      tramo: {
        id: 'TS-1',
        conductorId: 'd1',
        posLat: 41.39,
        posLng: 2.15,
        posActualizadaEn: new Date('2026-01-01T12:00:00Z'),
      } as Tramo,
      origen: null,
      destino: null,
    });
    expect(u.visible).toBe(true);
    expect(u.conductor?.lat).toBe(41.39);
    expect(u.callout).toBe('En camino al destino');
  });
});
