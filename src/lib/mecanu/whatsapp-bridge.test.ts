import { describe, expect, it } from 'vitest';
import {
  MAX_SESIONES_BRIDGE,
  conversacionIdDeJid,
  digitosEmparejarWhatsApp,
  jidDeTelefono,
  telefonoDeJid,
  urlPuenteWhatsApp,
} from './whatsapp-bridge';

describe('whatsapp-bridge helpers', () => {
  it('mapea jid ↔ teléfono sin forzar +34 a números ya internacionales', () => {
    expect(jidDeTelefono('655 111 222')).toBe('34655111222@s.whatsapp.net');
    expect(jidDeTelefono('56945088077')).toBe('56945088077@s.whatsapp.net');
    expect(jidDeTelefono('34611452943')).toBe('34611452943@s.whatsapp.net');
    expect(telefonoDeJid('34655111222@s.whatsapp.net')).toBe('34655111222');
    expect(conversacionIdDeJid('34655111222@s.whatsapp.net')).toBe('wac-jid-34655111222');
  });

  it('el tope del puente es 5, igual que el producto', () => {
    expect(MAX_SESIONES_BRIDGE).toBe(5);
  });

  it('la URL por defecto es localhost (no Vercel)', () => {
    expect(urlPuenteWhatsApp()).toMatch(/^http:\/\/127\.0\.0\.1:/);
  });

  it('normaliza teléfono para código de emparejamiento', () => {
    expect(digitosEmparejarWhatsApp('655 111 222')).toBe('34655111222');
    expect(digitosEmparejarWhatsApp('+34 655 111 222')).toBe('34655111222');
    expect(digitosEmparejarWhatsApp('56945088077')).toBe('56945088077');
    expect(digitosEmparejarWhatsApp('123')).toBeNull();
  });
});
