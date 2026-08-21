import { describe, expect, it } from 'vitest';
import { crearRutaDesdeCampana } from './crear-ruta-desde-campana';
import type { Campana } from './types';

function campanaBase(over: Partial<Campana> = {}): Campana {
  return {
    id: 'CMP-9001',
    clienteId: 'c1',
    vehiculoId: 'v1',
    rutaOrigenId: null,
    rutaGeneradaId: null,
    inspeccionId: null,
    items: [],
    tipos: [],
    etiquetas: [],
    falla: 'Pastillas de freno',
    evidencia: 'check-in',
    valor: 284.5,
    servicio: null,
    urgente: false,
    severidad: 'media',
    fecha: new Date('2026-08-20T10:00:00Z'),
    habito: '',
    motivoFecha: '',
    fotoUrl: null,
    estadoEnvio: '',
    presupuestoId: 'PR-OLD',
    presupuesto: {
      id: 'PR-OLD',
      campanaId: 'CMP-9001',
      vehiculoId: 'v1',
      rutaOrigenId: null,
      rutaGeneradaId: null,
      modo: 'detallado',
      lineas: [
        { descripcion: 'Pastillas', importe: 194.5, origen: 'manual', servicioTemparioId: null },
        { descripcion: 'Traslado ida', importe: 90, origen: 'traslado', servicioTemparioId: 'SV-11' },
      ],
      estado: 'aceptada',
      ivaIncluido: true,
      creado: new Date(),
      actualizado: new Date(),
      total: 284.5,
    },
    estado: 'aceptada',
    origenAutomatico: false,
    ...over,
  };
}

describe('crearRutaDesdeCampana', () => {
  it('sin fecha nace en prospectos / sin_fecha', () => {
    const r = crearRutaDesdeCampana(
      campanaBase(),
      {
        campanaId: 'CMP-9001',
        modo: 'tal_cual',
        tipoServicio: 'Frenos',
        fecha: null,
        franja: null,
      },
      { nextRutaId: () => 'TR-2001', direccionCliente: 'Calle Mayor 1, Madrid' },
    );
    expect(r.ruta.estado).toBe('prospectos');
    expect(r.ruta.subestado).toBe('sin_fecha');
    expect(r.paradas).toHaveLength(2);
    expect(r.tramos).toHaveLength(1);
    expect(r.tramos[0].estado).toBe('sin_agenda');
    expect(r.presupuesto.estado).toBe('aceptada');
    expect(r.presupuesto.lineas.some((l) => l.origen === 'traslado')).toBe(true);
  });

  it('con fecha nace en agendado / sin_conductor', () => {
    const fecha = new Date('2026-08-25T09:00:00Z');
    const r = crearRutaDesdeCampana(
      campanaBase(),
      {
        campanaId: 'CMP-9001',
        modo: 'tal_cual',
        tipoServicio: 'Frenos',
        fecha,
        franja: '09:00 - 10:00',
      },
      { nextRutaId: () => 'TR-2002' },
    );
    expect(r.ruta.estado).toBe('agendado');
    expect(r.ruta.subestado).toBe('sin_conductor');
    expect(r.tramos[0].ventana?.inicio).toBe('09:00');
    expect(r.tramos[0].ventana?.fin).toBe('10:00');
  });

  it('solo_total deja una línea manual y añade traslado si falta', () => {
    const c = campanaBase({
      presupuesto: {
        ...campanaBase().presupuesto,
        lineas: [{ descripcion: 'Cerrado', importe: 200, origen: 'manual', servicioTemparioId: null }],
        total: 200,
      },
    });
    const r = crearRutaDesdeCampana(
      c,
      {
        campanaId: 'CMP-9001',
        modo: 'solo_total',
        lineas: [{ descripcion: 'x', importe: 200, origen: 'manual' }],
        tipoServicio: 'Pack',
        fecha: null,
        franja: null,
      },
      { nextRutaId: () => 'TR-2003', importeTrasladoIda: 45 },
    );
    expect(r.presupuesto.modo).toBe('solo_total');
    expect(r.presupuesto.lineas.filter((l) => l.origen === 'traslado')).toHaveLength(1);
    expect(r.presupuesto.total).toBe(245);
  });
});
