import { describe, expect, it } from 'vitest';
import {
  construirVistaFlota, esEstadoFlotaMapa, posSemillaConductor, proximasCitas, textoUltimaVez,
  type CitaRutaInput,
} from './flota-panel';

function ruta(parcial: Partial<CitaRutaInput> & { id: string }): CitaRutaInput {
  return {
    id: parcial.id,
    estado: parcial.estado ?? 'agendado',
    fecha: parcial.fecha ?? null,
    fechaPropuesta: parcial.fechaPropuesta,
  };
}

describe('proximasCitas', () => {
  const ahora = new Date('2026-08-26T16:00:00');

  it('incluye citas de hoy aunque la ventana ya pasó hace más de 2 h', () => {
    const list = proximasCitas([
      ruta({ id: 'a', fecha: new Date('2026-08-26T08:00:00'), estado: 'agendado' }),
      ruta({ id: 'b', fecha: new Date('2026-08-26T18:00:00'), estado: 'agendado' }),
    ], ahora);
    expect(list.map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('prioriza en_ruta y excluye canceladas/completadas', () => {
    const list = proximasCitas([
      ruta({ id: 'c', estado: 'cancelado', fecha: new Date('2026-08-26T17:00:00') }),
      ruta({ id: 'd', estado: 'en_ruta', fecha: new Date('2026-08-26T10:00:00') }),
      ruta({ id: 'e', estado: 'completado', fecha: new Date('2026-08-26T12:00:00') }),
    ], ahora);
    expect(list.map((r) => r.id)).toEqual(['d']);
  });

  it('usa fechaPropuesta si no hay fecha comprometida', () => {
    const list = proximasCitas([
      ruta({
        id: 'p',
        estado: 'prospectos',
        fecha: null,
        fechaPropuesta: new Date('2026-08-27T09:00:00'),
      }),
    ], ahora);
    expect(list).toHaveLength(1);
  });
});

describe('textoUltimaVez', () => {
  const ahora = new Date('2026-08-26T12:00:00');

  it('dice Ahora / En vivo / hace N min', () => {
    expect(textoUltimaVez(new Date(ahora.getTime() - 10_000), ahora)).toBe('Ahora');
    expect(textoUltimaVez(new Date(ahora.getTime() - 90_000), ahora)).toBe('En vivo');
    expect(textoUltimaVez(new Date(ahora.getTime() - 12 * 60_000), ahora)).toBe('hace 12 min');
  });
});

describe('esEstadoFlotaMapa', () => {
  it('solo en_ruta y en_taller', () => {
    expect(esEstadoFlotaMapa('en_ruta')).toBe(true);
    expect(esEstadoFlotaMapa('en_taller')).toBe(true);
    expect(esEstadoFlotaMapa('agendado')).toBe(false);
  });
});

describe('construirVistaFlota', () => {
  const tallerDir = 'Carrer de Numància 105, Nau 3, 08029 Barcelona';
  const tallerCoords = { lat: 41.3836, lng: 2.1381 };

  it('prioriza GPS de tramo; en ruta sin GPS también aparece', () => {
    const seed = posSemillaConductor('d1', tallerCoords);
    const vista = construirVistaFlota({
      tallerDireccion: tallerDir,
      tallerNombre: 'Talleres Rodríguez',
      ahora: new Date('2026-08-26T12:00:00'),
      rutas: [
        {
          id: 'TR-1',
          estado: 'en_ruta',
          conductorId: 'd1',
          vehiculoLabel: '4521 KTM · Seat León',
          conductorNombre: 'Javier Molina',
          direccionCard: 'Carrer de Muntaner 340',
        },
        {
          id: 'TR-2',
          estado: 'en_ruta',
          conductorId: 'd2',
          vehiculoLabel: '1234 ABC · VW Golf',
          conductorNombre: 'Ana Torres',
          direccionCard: null,
        },
        {
          id: 'TR-x',
          estado: 'agendado',
          conductorId: 'd5',
          vehiculoLabel: 'Ignorado',
          conductorNombre: 'Sergio',
          direccionCard: null,
        },
      ],
      tramos: [{
        rutaId: 'TR-1',
        conductorId: 'd1',
        estado: 'en_curso',
        posLat: 41.39,
        posLng: 2.15,
        posActualizadaEn: new Date('2026-08-26T11:59:30'),
      }],
    });
    expect(vista.marcadores.some((m) => m.id === 'taller')).toBe(false);
    const d1 = vista.marcadores.find((m) => m.rutaId === 'TR-1');
    expect(d1?.lat).toBe(41.39);
    expect(d1?.lng).toBe(2.15);
    expect(d1?.enVivo).toBe(true);
    expect(d1?.estado).toBe('en_ruta');
    expect(d1?.lat).not.toBe(seed.lat);
    const d2 = vista.marcadores.find((m) => m.rutaId === 'TR-2');
    expect(d2?.ultimaVezLabel).toBe('En ruta');
    expect(vista.marcadores.some((m) => m.rutaId === 'TR-x')).toBe(false);
    expect(vista.marcadores).toHaveLength(2);
  });

  it('en_taller cae en coords del taller (varios → mismo punto para cluster)', () => {
    const vista = construirVistaFlota({
      tallerDireccion: tallerDir,
      tallerNombre: 'Talleres Rodríguez',
      rutas: [
        {
          id: 'TR-a',
          estado: 'en_taller',
          conductorId: null,
          vehiculoLabel: '1111 AAA',
          conductorNombre: null,
          direccionCard: null,
        },
        {
          id: 'TR-b',
          estado: 'en_taller',
          conductorId: 'd1',
          vehiculoLabel: '2222 BBB',
          conductorNombre: 'Javier',
          direccionCard: null,
        },
      ],
    });
    expect(vista.marcadores).toHaveLength(2);
    for (const m of vista.marcadores) {
      expect(m.estado).toBe('en_taller');
      expect(m.lat).toBeCloseTo(tallerCoords.lat, 4);
      expect(m.lng).toBeCloseTo(tallerCoords.lng, 4);
      expect(m.ultimaVezLabel).toBe('En taller');
      expect(m.direccion).toContain('Numància');
    }
  });

  it('no pinta agendados ni otras rutas', () => {
    const vista = construirVistaFlota({
      tallerDireccion: tallerDir,
      tallerNombre: 'Talleres Rodríguez',
      rutas: [
        {
          id: 'TR-1',
          estado: 'agendado',
          conductorId: 'd1',
          vehiculoLabel: 'X',
          conductorNombre: 'Javier',
          direccionCard: null,
        },
        {
          id: 'TR-2',
          estado: 'completado',
          conductorId: 'd2',
          vehiculoLabel: 'Y',
          conductorNombre: null,
          direccionCard: null,
        },
      ],
    });
    expect(vista.marcadores).toHaveLength(0);
  });

  it('copia marca y modelo del vehículo; sin dato no inventa foto', () => {
    const vista = construirVistaFlota({
      tallerDireccion: tallerDir,
      tallerNombre: 'Talleres Rodríguez',
      rutas: [
        {
          id: 'TR-foto',
          estado: 'en_taller',
          conductorId: null,
          vehiculoLabel: '4521 KTM · Seat León',
          conductorNombre: null,
          direccionCard: null,
          marca: 'Seat',
          modelo: 'Leon',
        },
        {
          id: 'TR-sin',
          estado: 'en_taller',
          conductorId: null,
          vehiculoLabel: '0000 AAA',
          conductorNombre: null,
          direccionCard: null,
          marca: '  ',
          modelo: null,
        },
      ],
    });
    const con = vista.marcadores.find((m) => m.rutaId === 'TR-foto');
    expect(con?.marca).toBe('Seat');
    expect(con?.modelo).toBe('Leon');
    expect(con?.fotoUrl).toBe('/api/v1/vehicle-photo?marca=Seat&modelo=Leon&v=wiki2');
    const sin = vista.marcadores.find((m) => m.rutaId === 'TR-sin');
    expect(sin?.marca).toBeNull();
    expect(sin?.modelo).toBeNull();
    expect(sin?.fotoUrl).toBeNull();
  });
});
