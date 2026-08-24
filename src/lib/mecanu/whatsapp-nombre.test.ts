import { describe, expect, it } from 'vitest';
import {
  etiquetaNombreBandeja,
  limpiarNombreWhatsApp,
  nombreWaUtil,
} from './whatsapp-nombre';

describe('whatsapp-nombre', () => {
  it('quita emoji e iconos del nombre', () => {
    expect(limpiarNombreWhatsApp('🔥 Cristofer 🚗')).toBe('Cristofer');
    expect(limpiarNombreWhatsApp('Ana ✨ López')).toBe('Ana López');
  });

  it('detecta nombres útiles vs solo número', () => {
    expect(nombreWaUtil('Cristofer', '+56 9 4508 8077')).toBe(true);
    expect(nombreWaUtil('56945088077', '56945088077')).toBe(false);
    expect(nombreWaUtil('', '56945088077')).toBe(false);
  });

  it('ficha gana; sin ficha pone ~ delante del nombre de WhatsApp', () => {
    expect(
      etiquetaNombreBandeja({
        nombreFicha: 'Cristofer',
        nombreWa: '🔥 Criss',
        telefono: '+56 9 4508 8077',
      }),
    ).toBe('Cristofer');

    expect(
      etiquetaNombreBandeja({
        nombreFicha: null,
        nombreWa: '🔥 Priscila',
        telefono: '34655111222',
      }),
    ).toBe('~ Priscila');

    expect(
      etiquetaNombreBandeja({
        nombreFicha: null,
        nombreWa: '~ YaTilde',
        telefono: '34655111222',
      }),
    ).toBe('~ YaTilde');
  });
});
