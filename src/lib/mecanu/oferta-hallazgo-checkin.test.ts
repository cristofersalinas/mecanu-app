import { describe, expect, it } from 'vitest';
import {
  etiquetaHallazgoCheckin,
  servicioIdParaHallazgoCheckin,
  tipoDeteccionParaHallazgo,
} from './oferta-hallazgo-checkin';

describe('oferta-hallazgo-checkin', () => {
  it('mapea testigos ámbar e ítems a servicios del tempario', () => {
    expect(servicioIdParaHallazgoCheckin('presion')).toBe('SV-02');
    expect(servicioIdParaHallazgoCheckin('item:focos')).toBe('SV-01');
    expect(servicioIdParaHallazgoCheckin('item:plumillas')).toBe('SV-08');
    expect(servicioIdParaHallazgoCheckin('rueda:di')).toBe('SV-02');
    expect(tipoDeteccionParaHallazgo('motor')).toBe('aceite');
  });

  it('mapea carrocería, cristales y limpieza al tempario con precios IVA', async () => {
    const { servicio } = await import('./mecanu-data');
    expect(servicioIdParaHallazgoCheckin('item:carroceria')).toBe('SV-12');
    expect(servicioIdParaHallazgoCheckin('item:cristales')).toBe('SV-13');
    expect(servicioIdParaHallazgoCheckin('item:limpieza')).toBe('SV-14');
    expect(servicio('SV-12')?.totalIva).toBe(150);
    expect(servicio('SV-13')?.totalIva).toBe(120);
    expect(servicio('SV-14')?.totalIva).toBe(39);
  });

  it('etiquetas legibles', () => {
    expect(etiquetaHallazgoCheckin('item:plumillas')).toBe('Plumillas');
    expect(etiquetaHallazgoCheckin('rueda:dd')).toMatch(/Neumático/);
  });
});
