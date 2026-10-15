import { describe, expect, it } from 'vitest';
import type { Cliente, Ruta } from './types';
import {
  enriquecerConversacion,
  filtrarConversaciones,
} from './whatsapp-enriquecer';
import type { ConversacionWaPersonal } from './whatsapp-personal';

const cliente: Cliente = {
  id: 'c1',
  nombre: 'Ana López',
  tipo: 'Particular',
  telefono: '655111222',
  email: 'ana@example.com',
  direccion: 'Madrid',
  desde: new Date('2024-01-01'),
};

const ruta = (partial: Partial<Ruta>): Ruta =>
  ({
    id: 'TR-1',
    vehiculoId: null,
    clienteId: 'c1',
    perfilServicio: 'x',
    modeloPrecio: 'x',
    precioTotal: 0,
    estado: 'completado',
    subestado: '',
    tagsManual: [],
    clienteTieneAuto: null,
    vehiculoListo: null,
    campanaOrigenId: null,
    presupuestoId: 'PR-1',
    motivo: null,
    canceladaEn: null,
    incidencia: null,
    matriculaLead: null,
    linkToken: null,
    linkEnviadoEn: null,
    creadaEn: new Date('2026-07-01'),
    ...partial,
  }) as Ruta;

describe('whatsapp-enriquecer', () => {
  it('marca prospecto si el teléfono no está en clientes', () => {
    const c: ConversacionWaPersonal = {
      id: 'wac-1',
      tallerId: 't',
      sesionId: null,
      clienteId: null,
      nombre: '56945088077',
      telefono: '56945088077',
      actualizadoEn: new Date().toISOString(),
      ultimoTexto: null,
    };
    const e = enriquecerConversacion(c, [cliente], []);
    expect(e.cicloVida).toBe('prospecto');
    expect(e.clienteNombre).toBeNull();
    expect(e.nombreSoloWhatsApp).toBe(false);
  });

  it('sin ficha y con push name: ~ y sin emoji', () => {
    const c: ConversacionWaPersonal = {
      id: 'wac-x',
      tallerId: 't',
      sesionId: null,
      clienteId: null,
      nombre: '🔥 Marisa',
      telefono: '34600111222',
      actualizadoEn: new Date().toISOString(),
      ultimoTexto: null,
    };
    const e = enriquecerConversacion(c, [cliente], []);
    expect(e.nombre).toBe('~ Marisa');
    expect(e.nombreSoloWhatsApp).toBe(true);
  });

  it('cruza teléfono ES y pone nombre de ficha + ciclo', () => {
    const c: ConversacionWaPersonal = {
      id: 'wac-2',
      tallerId: 't',
      sesionId: null,
      clienteId: null,
      nombre: '34655111222',
      telefono: '34655111222',
      actualizadoEn: new Date().toISOString(),
      ultimoTexto: 'hola',
    };
    const e = enriquecerConversacion(c, [cliente], [ruta({})], new Date('2026-08-23'));
    expect(e.cicloVida).toBe('nuevo');
    expect(e.nombre).toBe('Ana López');
    expect(e.nombreSoloWhatsApp).toBe(false);
    expect(e.ordenesCompletadas).toBe(1);
  });

  it('filtra por nombre, teléfono o ciclo', () => {
    const base = enriquecerConversacion(
      {
        id: 'wac-2',
        tallerId: 't',
        sesionId: null,
        clienteId: 'c1',
        nombre: 'Ana López',
        telefono: '34655111222',
        actualizadoEn: new Date().toISOString(),
        ultimoTexto: 'presupuesto',
      },
      [cliente],
      [ruta({})],
      new Date('2026-08-23'),
    );
    expect(filtrarConversaciones([base], 'ana').length).toBe(1);
    expect(filtrarConversaciones([base], '655').length).toBe(1);
    expect(filtrarConversaciones([base], 'nuevo').length).toBe(1);
    expect(filtrarConversaciones([base], 'zzzz').length).toBe(0);
  });
});
