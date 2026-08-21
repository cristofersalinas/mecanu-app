import { describe, expect, it } from 'vitest';
import {
  armarAviso, debeAvisarSinAgendar, debeEnviarDigest, plantillaChurnSinAgendar, plantillaDigest,
  plantillaSmsVentana,
} from './outbox';

describe('Outbox de avisos (mock)', () => {
  it('el digest no sale antes de 3 días', () => {
    const ahora = new Date('2026-08-20');
    expect(debeEnviarDigest(null, ahora)).toBe(true);
    expect(debeEnviarDigest(new Date('2026-08-18'), ahora)).toBe(false);
    expect(debeEnviarDigest(new Date('2026-08-16'), ahora)).toBe(true);
  });

  it('churn a los 7 días sin agendar', () => {
    const ahora = new Date('2026-08-20');
    expect(debeAvisarSinAgendar(new Date('2026-08-14'), ahora)).toBe(false);
    expect(debeAvisarSinAgendar(new Date('2026-08-13'), ahora)).toBe(true);
    expect(plantillaChurnSinAgendar(7).cuerpo).toMatch(/7 días/);
  });

  it('SMS de ventana no lleva asunto', () => {
    const sms = armarAviso('sms', '+34600111222', plantillaSmsVentana('1234 KLM', '10:00 - 11:00'));
    expect(sms.asunto).toBeNull();
    expect(sms.cuerpo).toMatch(/1234 KLM/);
    const mail = armarAviso('email', 'taller@ejemplo.es', plantillaDigest());
    expect(mail.asunto).toBeTruthy();
  });
});
