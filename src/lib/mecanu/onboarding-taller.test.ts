import { describe, expect, it } from 'vitest';
import {
  encuestaPendiente, marcarLeccion, ONBOARDING_TALLER_INICIAL, progresoLecciones, responderEncuesta,
} from './onboarding-taller';

describe('Encuesta de onboarding del taller', () => {
  it('la primera pregunta, la segunda aconseja; dos no y no vuelve', () => {
    let o = ONBOARDING_TALLER_INICIAL;
    expect(encuestaPendiente(o)).toBe('preguntar');
    o = responderEncuesta(o, false);
    expect(encuestaPendiente(o)).toBe('aconsejar');
    o = responderEncuesta(o, false);
    expect(o.silencio).toBe(true);
    expect(encuestaPendiente(o)).toBeNull();
  });

  it('si dice que sí, se calla la encuesta y el tutorial sigue existiendo', () => {
    const o = responderEncuesta(ONBOARDING_TALLER_INICIAL, true);
    expect(encuestaPendiente(o)).toBeNull();
    expect(progresoLecciones(marcarLeccion(o, 'agendar')).hechas).toBe(1);
  });
});
