import { describe, expect, it } from 'vitest';
import { PASOS_EN_RUTA } from './mecanu-pipeline';
import { efectoAvanceSubestadoEnRuta, efectoEntregaRuta, esPasoEnRuta } from './transicion-en-ruta';

describe('efectoAvanceSubestadoEnRuta', () => {
  it('iniciar viaje (en_camino_origen) promociona la ruta a en_ruta y el tramo a en_curso', () => {
    expect(efectoAvanceSubestadoEnRuta('en_camino_origen')).toEqual({
      tramo: { estado: 'en_curso', subestado: 'en_camino_origen' },
      ruta: { estado: 'en_ruta', subestado: 'en_camino_origen' },
    });
  });

  it('cada peldaño de EN RUTA mantiene la ruta en en_ruta y copia el subestado', () => {
    expect(PASOS_EN_RUTA).toEqual(['en_camino_origen', 'en_origen', 'en_transito', 'en_destino']);
    for (const paso of PASOS_EN_RUTA) {
      expect(esPasoEnRuta(paso)).toBe(true);
      const efecto = efectoAvanceSubestadoEnRuta(paso);
      expect(efecto?.ruta.estado).toBe('en_ruta');
      expect(efecto?.ruta.subestado).toBe(paso);
      expect(efecto?.tramo.estado).toBe('en_curso');
      expect(efecto?.tramo.subestado).toBe(paso);
    }
  });

  it('un id que no es peldaño de EN RUTA no toca la ruta', () => {
    expect(efectoAvanceSubestadoEnRuta('aceptado')).toBeNull();
    expect(efectoAvanceSubestadoEnRuta('agendado')).toBeNull();
    expect(esPasoEnRuta('completado')).toBe(false);
  });
});

describe('efectoEntregaRuta', () => {
  it('ida e interno dejan la ruta en taller (vuelta aún por agendar)', () => {
    expect(efectoEntregaRuta('ida')).toEqual({
      estado: 'en_taller',
      subestado: 'esperando_agenda_vuelta',
    });
    expect(efectoEntregaRuta('interno')).toEqual({
      estado: 'en_taller',
      subestado: 'esperando_agenda_vuelta',
    });
  });

  it('la vuelta cierra el servicio', () => {
    expect(efectoEntregaRuta('vuelta')).toEqual({
      estado: 'completado',
      subestado: 'ok',
    });
  });
});
