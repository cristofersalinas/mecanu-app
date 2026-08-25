import { describe, expect, it } from 'vitest';
import {
  camposFichaCliente,
  construirContextoContactoWa,
  fusionarFichaParcial,
  urlSeguimientoRuta,
} from './whatsapp-contexto';
import type { Cliente, RutaVista } from './types';

const clienteBase: Cliente = {
  id: 'c15',
  nombre: 'Cristofer',
  tipo: 'Particular',
  telefono: '+56 9 4508 8077',
  email: '',
  direccion: 'Carrer de Provença 210, 2ºA, 08036 Barcelona',
  desde: new Date('2026-01-01'),
};

describe('whatsapp-contexto', () => {
  it('propone link /s/{token} para seguimiento', () => {
    expect(urlSeguimientoRuta('cristofer-wa-demo')).toBe('https://mecanu.com/s/cristofer-wa-demo');
    expect(urlSeguimientoRuta(null)).toBeNull();
  });

  it('marca correo vacío como faltante y teléfono no editable', () => {
    const campos = camposFichaCliente(clienteBase, '+56 9 4508 8077');
    expect(campos.find((c) => c.key === 'email')?.faltante).toBe(true);
    expect(campos.find((c) => c.key === 'telefono')?.editable).toBe(false);
    expect(campos.find((c) => c.key === 'direccion')?.faltante).toBe(false);
  });

  it('fusionar ficha no pisa con vacío un valor existente', () => {
    const patch = fusionarFichaParcial(
      { nombre: 'Cristofer', email: 'a@b.com', direccion: 'Calle 1', telefono: '1' },
      { email: '', nombre: 'Cristofer Demo' },
    );
    expect(patch.nombre).toBe('Cristofer Demo');
    expect(patch.email).toBeUndefined();
  });

  it('separa historial completado y próximos activos', () => {
    const rutas = [
      {
        id: 'TR-1070',
        clienteId: 'c15',
        estado: 'completado',
        subestado: 'ok',
        descripcionServicio: 'Frenos',
        creadaEn: new Date('2026-01-01'),
        fecha: new Date('2026-01-01'),
        importe: 228,
        conductorId: null,
        franja: null,
        franjaPropuesta: null,
        fechaPropuesta: null,
        seguro: true,
        linkToken: null,
        vehiculoListo: true,
      },
      {
        id: 'TR-1071',
        clienteId: 'c15',
        estado: 'agendado',
        subestado: 'asignado',
        descripcionServicio: 'Aceite',
        creadaEn: new Date('2026-08-01'),
        fecha: new Date('2026-08-24'),
        importe: 90,
        conductorId: 'd1',
        franja: '09:00 - 10:00',
        franjaPropuesta: null,
        fechaPropuesta: null,
        seguro: true,
        linkToken: 'cristofer-wa-demo',
        vehiculoListo: false,
      },
    ] as unknown as RutaVista[];

    const ctx = construirContextoContactoWa({
      telefono: '+56 9 4508 8077',
      cliente: clienteBase,
      rutas,
      campanas: [],
      conductores: [
        {
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
      ],
      inspeccionesPorRuta: {},
    });

    expect(ctx.historial).toHaveLength(1);
    expect(ctx.proximos).toHaveLength(1);
    expect(ctx.proximos[0].conductorNombre).toContain('Javier');
    expect(ctx.linkSeguimientoActivo).toContain('/s/cristofer-wa-demo');
    expect(ctx.faltantes).toContain('Correo');
  });
});
