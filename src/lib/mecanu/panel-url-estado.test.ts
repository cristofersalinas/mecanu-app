import { describe, expect, it } from 'vitest';
import { leerEstadoUrl, searchDesdeParams, serializarEstadoUrl, urlCompletaEstado } from './panel-url-estado';

const local = (search: string) => ({
  pathname: '/panel',
  search,
  host: 'localhost:3001',
});

const negocio = (pathname: string, search = '') => ({
  pathname,
  search,
  host: 'negocio.localhost',
});

describe('panel-url-estado', () => {
  it('lee nav/sub en local desde query', () => {
    expect(leerEstadoUrl(local('?nav=tablero&sub=traslados'))).toMatchObject({
      nav: 'tablero',
      sub: 'traslados',
    });
  });

  it('lee path bonito en negocio', () => {
    expect(leerEstadoUrl(negocio('/tablero/campanas'))).toMatchObject({
      nav: 'tablero',
      sub: 'campanas',
    });
  });

  it('restaura entidad y ficha expandida', () => {
    const e = leerEstadoUrl(local('?nav=tablero&sub=traslados&ruta=TR-1042&ficha=1'));
    expect(e.seleccion).toEqual({ kind: 'ruta', id: 'TR-1042' });
    expect(e.modoFicha).toBe('ficha');
  });

  it('infiere tablero/traslados desde ?ruta= sin nav', () => {
    expect(leerEstadoUrl(local('?ruta=TR-AVANCE-1'))).toMatchObject({
      nav: 'tablero',
      sub: 'traslados',
      seleccion: { kind: 'ruta', id: 'TR-AVANCE-1' },
    });
  });

  it('serializa búsqueda y filtros con prefijo f.', () => {
    const url = urlCompletaEstado(
      {
        nav: 'tablero',
        sub: 'traslados',
        seleccion: null,
        modoFicha: 'panel',
        filtros: { q: '2080', estado: 'prospectos,agendado', vista: 'lista' },
      },
      local(''),
    );
    expect(url).toContain('nav=tablero');
    expect(url).toContain('sub=traslados');
    expect(url).toContain('f.q=2080');
    expect(url).toContain('f.estado=prospectos%2Cagendado');
    expect(url).toContain('f.vista=lista');
  });

  it('round-trip: leer lo que serializa', () => {
    const estado = {
      nav: 'contactos' as const,
      sub: 'clientes',
      seleccion: { kind: 'cliente' as const, id: 'CL-1' },
      modoFicha: 'panel' as const,
      filtros: { q: 'garcia' },
    };
    const loc = local('');
    const { pathname, search } = serializarEstadoUrl(estado, loc);
    expect(leerEstadoUrl({ pathname, search, host: loc.host })).toEqual(estado);
  });

  it('reconstruye la query de searchParams de Next para hidratar igual en servidor y cliente', () => {
    const search = searchDesdeParams({
      nav: 'contactos',
      sub: 'clientes',
      'f.q': 'garcia',
    });
    expect(leerEstadoUrl(local(search))).toMatchObject({
      nav: 'contactos',
      sub: 'clientes',
      filtros: { q: 'garcia' },
    });
  });

  it('negocio: path bonito sin nav/sub en query', () => {
    const { pathname, search } = serializarEstadoUrl(
      {
        nav: 'tablero',
        sub: 'traslados',
        seleccion: null,
        modoFicha: 'panel',
        filtros: { q: 'bmw' },
      },
      negocio('/general'),
    );
    expect(pathname).toBe('/tablero/traslados');
    expect(search).toContain('f.q=bmw');
    expect(search).not.toContain('nav=');
  });
});
