import { describe, expect, it } from 'vitest';
import { buscarContactos, type ContactoBusqueda } from './buscar-contactos';

const base: ContactoBusqueda[] = [
  {
    usuarioId: 'u1',
    nombre: 'Ana López',
    documento: '12345678Z',
    email: 'ana@taller.es',
    telefono: '600 111 222',
    rol: 'operacion',
    estado: 'activo',
    tallerNombre: 'Talleres Rodríguez',
    conductorId: null,
  },
  {
    usuarioId: 'u2',
    nombre: 'Javier Molina',
    documento: '87654321X',
    email: 'javier@mecanu.com',
    telefono: '611 000 000',
    rol: 'conductor',
    estado: 'activo',
    tallerNombre: 'Talleres Rodríguez',
    conductorId: 'd1',
  },
  {
    usuarioId: 'u3',
    nombre: 'Bea Ruiz',
    documento: null,
    email: 'bea@otro.es',
    telefono: null,
    rol: 'operacion',
    estado: 'invitado',
    tallerNombre: 'Otro Taller',
    conductorId: null,
  },
];

describe('buscarContactos', () => {
  it('query vacío devuelve la lista', () => {
    expect(buscarContactos(base, '')).toHaveLength(3);
  });

  it('prioriza coincidencia por nombre', () => {
    const r = buscarContactos(base, 'Javier');
    expect(r[0].usuarioId).toBe('u2');
  });

  it('prioriza DNI igual que nombre fuerte', () => {
    const r = buscarContactos(base, '12345678Z');
    expect(r[0].usuarioId).toBe('u1');
  });

  it('encuentra por email o teléfono', () => {
    expect(buscarContactos(base, 'bea@otro')[0].usuarioId).toBe('u3');
    expect(buscarContactos(base, '611000')[0].usuarioId).toBe('u2');
  });

  it('AND de tokens', () => {
    expect(buscarContactos(base, 'Ana Rodríguez')).toHaveLength(1);
    expect(buscarContactos(base, 'Ana Inexistente')).toHaveLength(0);
  });
});
