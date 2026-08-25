import { describe, expect, it } from 'vitest';
import { marcaCorta, refParadaKanban, tituloVehiculoKanban } from './kanban-card-copy';
import type { Parada } from '../data';

describe('marcaCorta', () => {
  it('acorta marcas compuestas', () => {
    expect(marcaCorta('Mercedes-Benz')).toBe('Mercedes');
    expect(marcaCorta('Alfa Romeo')).toBe('Alfa Romeo');
    expect(marcaCorta('Seat')).toBe('Seat');
  });
});

describe('tituloVehiculoKanban', () => {
  it('matrícula · marca corta + modelo', () => {
    expect(tituloVehiculoKanban(
      { id: 'v', marca: 'Mercedes-Benz', modelo: 'Clase A', anio: 2021, matricula: '8888 AVA', km: 0, color: '', usuarios: [] },
      null,
    )).toBe('8888 AVA · Mercedes Clase A');
  });
});

describe('refParadaKanban', () => {
  const taller: Parada = {
    id: 'p1', rutaId: 'r', orden: 1, tipo: 'proveedor', subtipo: 'taller',
    etiqueta: 'Taller', direccion: 'Carrer Numància 105, 08029 Barcelona',
    localidad: 'Barcelona', sublocalidad: 'Les Corts', servicios: [], llegadaReal: null, salidaReal: null,
  };
  const cliente: Parada = {
    id: 'p2', rutaId: 'r', orden: 0, tipo: 'cliente', subtipo: null,
    etiqueta: 'Cliente', direccion: 'Carrer Escorial 50, 08023 Barcelona',
    localidad: 'Barcelona', sublocalidad: 'La Salut', servicios: [], llegadaReal: null, salidaReal: null,
  };

  it('taller → Taller + distrito', () => {
    expect(refParadaKanban(taller)).toEqual({ bold: 'Taller', sub: 'Les Corts' });
  });

  it('cliente → barrio + ciudad', () => {
    expect(refParadaKanban(cliente)).toEqual({ bold: 'La Salut', sub: 'Barcelona' });
  });
});
