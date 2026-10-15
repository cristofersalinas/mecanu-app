import { describe, expect, it } from 'vitest';
import type { DeberTaller } from '@/lib/mecanu/deberes-taller';
import { contextoTareaCard, nombreClienteTareas } from './tarea-card-copy';

const deberRuta = (id: string, titulo = '6654 PLM'): DeberTaller => ({
  id: `crear-${id}`,
  tipo: 'crear_ruta',
  urgencia: 'ahora',
  entidadKind: 'ruta',
  entidadId: id,
  zona: 'campana_acciones',
  titulo,
  detalle: 'Aceptada',
  cta: 'Crear ruta',
  hintNudge: '',
});

const deberCampana = (id: string, titulo: string): DeberTaller => ({
  id: `seguir-${id}`,
  tipo: 'recordar_oferta',
  urgencia: 'cuando_puedas',
  entidadKind: 'campana',
  entidadId: id,
  zona: 'campana_acciones',
  titulo,
  detalle: 'Sin respuesta',
  cta: 'Seguir',
  hintNudge: '',
});

const ctxVacio = {
  rutaPorId: () => null,
  campanaPorId: () => null,
};

describe('contextoTareaCard', () => {
  it('resuelve cliente y vehículo desde la ruta (mock TR-1042)', () => {
    const ctx = contextoTareaCard(deberRuta('TR-1042'), {
      rutaPorId: (id) => (id === 'TR-1042' ? {
        id: 'TR-1042',
        clienteId: 'c1',
        vehiculoId: 'v1',
        matriculaLead: null,
      } as never : null),
      campanaPorId: () => null,
    });
    expect(ctx.nombreCliente).not.toBe('6654 PLM');
    expect(ctx.lineaVehiculo).toMatch(/·/);
  });

  it('no pone la matrícula en la fila de persona si falta la entidad', () => {
    const ctx = contextoTareaCard(deberRuta('TR-404'), ctxVacio);
    expect(ctx.nombreCliente).toBe('Diego Verde');
    expect(ctx.lineaVehiculo).toMatch(/6654 PLM/);
    expect(ctx.lineaVehiculo).toMatch(/·/);
  });

  it('en Hecho (seguir) resuelve cliente y vehículo aunque campanaPorId no encuentre la oferta', () => {
    const ctx = contextoTareaCard(deberCampana('OP-desaparecida', 'RK 4508'), ctxVacio);
    expect(ctx.nombreCliente).toBe('Cristofer');
    expect(ctx.nombreCliente).not.toBe('RK 4508');
    expect(ctx.lineaVehiculo).toMatch(/RK 4508/);
    expect(ctx.lineaVehiculo).toMatch(/Yaris/);
  });

  it('sin entidad ni matrícula conocida deja las dos filas explícitas', () => {
    const ctx = contextoTareaCard(deberCampana('OP-404', 'la oferta'), ctxVacio);
    expect(ctx.nombreCliente).toBe('Sin cliente');
    expect(ctx.lineaVehiculo).toBe('—');
  });
});

describe('nombreClienteTareas', () => {
  it('muestra nombre y primer apellido completos', () => {
    expect(nombreClienteTareas('Diego Verde Jiménez')).toBe('Diego Verde');
    expect(nombreClienteTareas('María Dolores Ruiz Campos')).toBe('María Dolores Ruiz');
    expect(nombreClienteTareas('Ana López')).toBe('Ana López');
  });
});
