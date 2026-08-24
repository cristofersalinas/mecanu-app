import { describe, expect, it } from 'vitest';
import {
  esRutaPanelBonita,
  parsePathBonitoPanel,
  pathBonitoPanel,
  pathBonitoDesdeUbicacionInterna,
} from './panel-rutas';

describe('panel-rutas', () => {
  it('reconoce rutas del panel en el subdominio', () => {
    expect(esRutaPanelBonita('/general')).toBe(true);
    expect(esRutaPanelBonita('/tablero/traslados')).toBe(true);
    expect(esRutaPanelBonita('/contacto')).toBe(false);
  });

  it('genera y parsea módulos y subsecciones', () => {
    expect(pathBonitoPanel({ nav: 'general', sub: 'general' })).toBe('/general');
    expect(pathBonitoPanel({ nav: 'tablero', sub: 'campanas' })).toBe('/tablero/campanas');
    expect(pathBonitoPanel({ nav: 'config', sub: 'empresa' })).toBe('/config/empresa');
    expect(parsePathBonitoPanel('/tablero/tareas')).toEqual({ nav: 'tablero', sub: 'tareas' });
    expect(parsePathBonitoPanel('/conductores/agendar')).toEqual({ nav: 'conductores', sub: 'agendar' });
  });

  it('no mete ids de entidad en la URL (privacidad)', () => {
    expect(pathBonitoPanel({ nav: 'tablero', sub: 'traslados' })).toBe('/tablero/traslados');
    // Un deep-link viejo con id se ignora: solo queda el módulo
    expect(parsePathBonitoPanel('/tablero/traslados/ruta/TR-1042/ficha')).toEqual({
      nav: 'tablero',
      sub: 'traslados',
    });
    expect(parsePathBonitoPanel('/contactos/cliente/c-seed-1')).toEqual({
      nav: 'contactos',
      sub: 'clientes',
    });
  });

  it('traduce auth y panel interno a URLs bonitas', () => {
    expect(pathBonitoDesdeUbicacionInterna('/panel/entrar')).toBe('/');
    expect(pathBonitoDesdeUbicacionInterna('/panel')).toBe('/general');
    expect(
      pathBonitoDesdeUbicacionInterna('/panel', { nav: 'tablero', sub: 'traslados' }),
    ).toBe('/tablero/traslados');
  });
});
