import { describe, expect, it } from 'vitest';
import {
  construirVistaFlota, posSemillaConductor, proximasCitas, textoUltimaVez,
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

describe('construirVistaFlota', () => {
  it('prioriza GPS de tramo; en ruta sin GPS también aparece', () => {
    const taller = { lat: 41.3836, lng: 2.1381 };
    const seed = posSemillaConductor('d1', taller);
    const vista = construirVistaFlota({
      tallerDireccion: 'Carrer de Numància 105, Nau 3, 08029 Barcelona',
      tallerNombre: 'Talleres Rodríguez',
      ahora: new Date('2026-08-26T12:00:00'),
      conductores: [
        { id: 'd1', nombre: 'Javier Molina', proceso: 'activo' },
        { id: 'd2', nombre: 'Ana Torres', proceso: 'activo' },
        { id: 'd5', nombre: 'Sergio', proceso: 'documentos_pendientes' },
      ],
      conductorIdsActivos: ['d1', 'd2'],
      tramos: [{
        conductorId: 'd1',
        estado: 'en_curso',
        posLat: 41.39,
        posLng: 2.15,
        posActualizadaEn: new Date('2026-08-26T11:59:30'),
      }],
    });
    expect(vista.marcadores[0]?.kind).toBe('taller');
    const d1 = vista.marcadores.find((m) => m.id === 'd1');
    expect(d1?.lat).toBe(41.39);
    expect(d1?.lng).toBe(2.15);
    expect(d1?.enVivo).toBe(true);
    expect(d1?.lat).not.toBe(seed.lat);
    const d2 = vista.marcadores.find((m) => m.id === 'd2');
    expect(d2?.ultimaVezLabel).toBe('En ruta');
    expect(vista.marcadores.some((m) => m.id === 'd5')).toBe(false);
  });

  it('no pinta conductores sin servicio en ruta ni GPS', () => {
    const vista = construirVistaFlota({
      tallerDireccion: 'Carrer de Numància 105, Nau 3, 08029 Barcelona',
      tallerNombre: 'Talleres Rodríguez',
      conductores: [
        { id: 'd1', nombre: 'Javier', proceso: 'activo' },
        { id: 'd6', nombre: 'Externo', proceso: 'activo', red: 'Externo Mecanu' },
      ],
      conductorIdsActivos: [],
    });
    expect(vista.marcadores.every((m) => m.kind === 'taller')).toBe(true);
  });
});
