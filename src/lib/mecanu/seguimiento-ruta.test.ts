import { describe, expect, it } from 'vitest';
import {
  checkinPublico,
  construirSeguimientoPublico,
  direccionCorta,
  nombreConductorPublico,
  pasosSeguimiento,
  presupuestoPublico,
  progresoPorcentaje,
  rutaPorLinkToken,
  tramosPublicos,
  ventanaPublica,
} from './seguimiento-ruta';
import type { Inspeccion, Presupuesto, RutaVista } from './types';

describe('seguimiento-ruta', () => {
  it('acorta el nombre del conductor', () => {
    expect(nombreConductorPublico('Javier Molina Serrano')).toBe('Javier M.');
    expect(nombreConductorPublico(null)).toBeNull();
  });

  it('acorta la dirección a localidad', () => {
    expect(direccionCorta('Av. Providencia 2120, Providencia, Santiago')).toBe(
      'Providencia, Santiago',
    );
  });

  it('marca pasos y progreso según estado', () => {
    const ag = pasosSeguimiento('agendado');
    expect(ag.find((p) => p.id === 'agendado')?.estado).toBe('actual');
    expect(progresoPorcentaje('en_ruta')).toBeGreaterThan(progresoPorcentaje('agendado'));
  });

  it('presupuesto solo traslado explica el caso', () => {
    const p = presupuestoPublico({
      id: 'PR-x',
      campanaId: null,
      vehiculoId: null,
      rutaOrigenId: null,
      rutaGeneradaId: 'TR-1',
      modo: 'detallado',
      lineas: [
        { descripcion: 'Traslado ida', importe: 45, origen: 'traslado', servicioTemparioId: null },
        { descripcion: 'Traslado vuelta', importe: 45, origen: 'traslado', servicioTemparioId: null },
      ],
      estado: 'aceptada',
      ivaIncluido: true,
      total: 90,
      creado: null,
      actualizado: null,
    } as Presupuesto);
    expect(p?.soloTraslado).toBe(true);
    expect(p?.nota).toMatch(/solo los traslados/i);
  });

  it('check-in ausente comunica la falta', () => {
    const c = checkinPublico([], 'agendado');
    expect(c.disponible).toBe(false);
    expect(c.pendienteMensaje).toMatch(/aún no ha registrado/i);
  });

  it('check-in presente expone km y daños', () => {
    const insp = {
      id: 'CHK-1',
      tipo: 'check-in',
      rutaId: 'TR-1071',
      trasladoId: null,
      fecha: new Date('2026-08-23T09:18:00'),
      inspector: 'd1',
      inspectorNombre: 'Javier Molina Serrano',
      sede: 'x',
      km: 38412,
      combustible: '1/2',
      combustiblePct: 55,
      limpieza: 'Limpio',
      vehiculo: { matricula: 'RK', modelo: 'Yaris', vin: 'x', km: 38412, combustible: '1/2', combustiblePct: 55 },
      itv: { estado: 'Al día', vence: [1, 1, 2027] },
      itvVence: new Date(),
      zonas: [],
      danos: [
        {
          zona: 'Parachoques',
          tipo: 'Rayón',
          descripcion: 'Rayón',
          ubicacion: 'dcha',
          foto: null,
          fotoUrl: null,
        },
      ],
      hallazgos: [],
      firmas: { cliente: null, conductor: 'data:x' },
    } as Inspeccion;
    const c = checkinPublico([insp], 'en_ruta');
    expect(c.disponible).toBe(true);
    expect(c.km).toBe(38412);
    expect(c.danos).toHaveLength(1);
    expect(c.firmaConductor).toBe(true);
  });

  it('resuelve por token y construye la vista pública', () => {
    const ruta = {
      id: 'TR-1071',
      linkToken: 'cristofer-wa-demo',
      estado: 'en_ruta',
      subestado: 'en_transito',
      descripcionServicio: 'Cambio de aceite',
      fecha: new Date('2026-08-24T09:00:00'),
      franja: '09:00 - 10:00',
      fechaPropuesta: null,
      franjaPropuesta: null,
      seguro: true,
      conductorId: 'd1',
      direccionOrigen: 'Av. Providencia 2120, Providencia, Santiago',
      direccionDestino: 'Carrer de Numància 105, Nau 3, 08029 Barcelona',
      etiquetaOrigen: 'Casa',
      etiquetaDestino: 'Taller',
      tramoActivoId: 'TS-1',
      presupuesto: null,
      creadaEn: new Date(),
    } as unknown as RutaVista;

    expect(rutaPorLinkToken([ruta], 'cristofer-wa-demo')?.id).toBe('TR-1071');
    expect(ventanaPublica(ruta)).toContain('09:00 - 10:00');

    const pub = construirSeguimientoPublico({
      token: 'cristofer-wa-demo',
      ruta,
      vehiculo: {
        id: 'v19',
        marca: 'Toyota',
        modelo: 'Yaris',
        anio: 2021,
        matricula: 'RK 4508',
        km: 1,
        color: 'Blanco',
        usuarios: [],
      },
      conductor: {
        id: 'd1',
        nombre: 'Javier Molina Serrano',
        telefono: '1',
        red: 'Interna',
        furgoneta: 'x',
        proceso: 'activo',
        supervisados: 3,
        requeridos: 3,
        alta: new Date(),
        calificacion: 5,
        valoraciones: 1,
        docs: { dni: true, carnet: true, iban: true, seguro: true },
        incidencias: [],
      },
      tallerNombre: 'Talleres Rodríguez',
      tramos: [],
      paradas: [],
      actividad: [],
      inspecciones: [],
    });

    expect(pub?.vehiculoLabel).toContain('Yaris');
    expect(pub?.conductorLabel).toBe('Javier M.');
    expect(pub?.estadoLabel).toBe('En ruta');
    expect(pub?.direccionOrigen).toBe('Av. Providencia 2120, Providencia, Santiago');
    expect(pub?.direccionDestino).toBe('Carrer de Numància 105, Nau 3, 08029 Barcelona');
    expect(pub?.etiquetaOrigen).toBe('Casa');
    expect(pub?.etiquetaDestino).toBe('Taller');
    expect(pub?.checkin.disponible).toBe(false);
    expect(pub?.checkin.pendienteMensaje).toBeTruthy();
  });

  it('expone direcciones completas en tramos públicos', () => {
    const tramos = tramosPublicos(
      [
        {
          id: 'TS-1071-1',
          rutaId: 'TR-1071',
          rol: 'ida',
          paradaOrigenId: 'PD-1071-1',
          paradaDestinoId: 'PD-1071-2',
          conductorId: 'd1',
          estado: 'en_curso',
          subestado: 'en_transito',
          ventana: { fecha: new Date('2026-08-24'), inicio: '09:00', fin: '10:00' },
          ventanaPropuesta: null,
          ventanaModo: 'fija_taller',
          seguro: true,
          reprogramaciones: 0,
          importe: 45,
        },
      ] as import('./types').Tramo[],
      [
        {
          id: 'PD-1071-1',
          rutaId: 'TR-1071',
          orden: 1,
          tipo: 'cliente',
          subtipo: null,
          etiqueta: 'Casa',
          direccion: 'Av. Providencia 2120, Providencia, Santiago',
          localidad: 'Santiago',
          servicios: [],
          salidaReal: new Date('2026-08-24T09:18:00'),
          llegadaReal: null,
        },
        {
          id: 'PD-1071-2',
          rutaId: 'TR-1071',
          orden: 2,
          tipo: 'proveedor',
          subtipo: 'taller',
          etiqueta: 'Taller',
          direccion: 'Carrer de Numància 105, Nau 3, 08029 Barcelona',
          localidad: 'Barcelona',
          servicios: [],
          salidaReal: null,
          llegadaReal: null,
        },
      ] as unknown as import('./types').Parada[],
      'TS-1071-1',
    );
    expect(tramos[0]?.origenDireccion).toContain('Providencia');
    expect(tramos[0]?.destinoDireccion).toContain('Numància');
  });
});
