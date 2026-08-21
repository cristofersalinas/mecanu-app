import { describe, expect, it } from 'vitest';
import { reemplazarArray, revivirFechas } from '@/components/taller/hidratar-panel';

describe('hidratar-panel', () => {
  it('reemplaza el array in-place', () => {
    const dest = [{ id: 'a' }, { id: 'b' }];
    reemplazarArray(dest, [{ id: 'c' }]);
    expect(dest).toEqual([{ id: 'c' }]);
  });

  it('revive fechas ISO anidadas', () => {
    const out = revivirFechas({
      id: '1',
      creadaEn: '2026-08-21T10:00:00.000Z',
      nested: { fecha: '2026-08-22T12:00:00.000Z' },
    });
    expect(out.creadaEn).toBeInstanceOf(Date);
    expect(out.nested.fecha).toBeInstanceOf(Date);
  });
});
