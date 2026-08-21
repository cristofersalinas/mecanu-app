import { describe, expect, it } from 'vitest';
import { leerEntorno } from './entorno';

describe('Entorno: local vs producción, demo solo en tu Mac', () => {
  it('npm run dev (sin flags) = local, sin demo', () => {
    expect(leerEntorno({})).toEqual({ mundo: 'local', demo: false, enVercel: false });
  });

  it('npm run demo = local con demo', () => {
    expect(leerEntorno({ MECANU_DEMO: '1', NEXT_PUBLIC_MECANU_DEMO: '1' }).demo).toBe(true);
    expect(leerEntorno({ MECANU_DEMO: '1' }).mundo).toBe('local');
  });

  it('en mecanu.com jamás hay demo, aunque la variable esté a 1', () => {
    const e = leerEntorno({
      VERCEL: '1',
      VERCEL_ENV: 'production',
      MECANU_DEMO: '1',
      NEXT_PUBLIC_MECANU_DEMO: '1',
    });
    expect(e.mundo).toBe('produccion');
    expect(e.demo).toBe(false);
  });

  it('un preview de PR no es staging permanente ni demo', () => {
    const e = leerEntorno({ VERCEL: '1', VERCEL_ENV: 'preview', MECANU_DEMO: '1' });
    expect(e.mundo).toBe('preview');
    expect(e.demo).toBe(false);
  });
});
