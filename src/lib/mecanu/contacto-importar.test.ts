import { describe, expect, it } from 'vitest';
import {
  buscarClientePorDigitos,
  clienteNuevoDesdeImport,
  deduplicarFilasLote,
  fusionarContactoExistente,
  nombreContactoUtil,
  nombreParaAlta,
  parseCsvContactos,
  telefonoDigitosContacto,
} from './contacto-importar';
import type { Cliente } from './types';

describe('contacto-importar', () => {
  it('normaliza teléfono a dígitos', () => {
    expect(telefonoDigitosContacto('+56 9 4508 8077')).toBe('56945088077');
    expect(telefonoDigitosContacto('123')).toBeNull();
  });

  it('rechaza nombre que es solo el número', () => {
    expect(nombreContactoUtil('56945088077', '+56 9 4508 8077')).toBe(false);
    expect(nombreContactoUtil('Cristofer', '+56 9 4508 8077')).toBe(true);
    expect(nombreParaAlta(null, '+56945088077')).toMatch(/^Contacto /);
  });

  it('deduplica el lote y conserva el mejor nombre', () => {
    const { unicas, omitidasDup, invalidas } = deduplicarFilasLote([
      { telefono: '56945088077', nombre: null },
      { telefono: '+56 9 4508 8077', nombre: 'Cristofer' },
      { telefono: '12', nombre: 'X' },
    ]);
    expect(invalidas).toHaveLength(1);
    expect(omitidasDup).toHaveLength(1);
    expect(unicas).toHaveLength(1);
    expect(unicas[0]!.nombre).toBe('Cristofer');
  });

  it('merge no pisa nombre bueno ni email existente', () => {
    const actual: Cliente = {
      id: 'c1',
      nombre: 'Cristofer',
      tipo: 'Particular',
      telefono: '+56 9 4508 8077',
      email: 'c@x.com',
      direccion: '',
      desde: new Date('2026-01-01'),
      origen: 'manual',
    };
    const { cambio, patch, cliente } = fusionarContactoExistente(
      actual,
      {
        telefono: '+56 9 4508 8077',
        telefonoDigitos: '56945088077',
        nombre: '56945088077',
        email: 'otro@x.com',
        direccion: 'Providencia',
        indiceOrigen: 0,
      },
      'whatsapp_sync',
    );
    expect(cambio).toBe(true);
    expect(patch.nombre).toBeUndefined();
    expect(patch.email).toBeUndefined();
    expect(patch.direccion).toBe('Providencia');
    expect(cliente.origen).toBe('manual');
    expect(cliente.origenUltimo).toBe('whatsapp_sync');
  });

  it('crea cliente nuevo con origen del lote', () => {
    const c = clienteNuevoDesdeImport(
      'c-x',
      {
        telefono: '655111222',
        telefonoDigitos: '655111222',
        nombre: 'Ana',
        email: '',
        direccion: '',
        indiceOrigen: 0,
      },
      'excel',
      'clientes.xlsx',
    );
    expect(c.origen).toBe('excel');
    expect(c.cicloVida).toBe('registrado');
  });

  it('parsea CSV con cabecera telefono,nombre', () => {
    const rows = parseCsvContactos('telefono,nombre\n655111222,María\n655222333,\n');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ telefono: '655111222', nombre: 'María' });
  });

  it('busca por dígitos aunque el formato difiera', () => {
    const hit = buscarClientePorDigitos(
      [
        {
          id: 'c15',
          nombre: 'Cristofer',
          tipo: 'Particular',
          telefono: '+56 9 4508 8077',
          email: '',
          direccion: '',
          desde: new Date(),
          telefonoDigitos: '56945088077',
        },
      ],
      '56945088077',
    );
    expect(hit?.id).toBe('c15');
  });
});
