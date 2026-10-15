import { describe, expect, it } from 'vitest';
import {
  combustiblePct,
  etiquetaEnRutaKanban,
  indiceStepperEnRuta,
  primerNombre,
  tipoSolicitudApi,
  urlEvidenciaPublicable,
} from './etiqueta-en-ruta';

describe('etiqueta-en-ruta', () => {
  it('primerNombre corta al primero', () => {
    expect(primerNombre('Nora Avance')).toBe('Nora');
    expect(primerNombre('  Javier Molina Pérez  ')).toBe('Javier');
    expect(primerNombre(null)).toBeNull();
  });

  it('kanban: solo la frase, sin nombre del conductor', () => {
    expect(etiquetaEnRutaKanban('en_ruta', 'en_camino_origen', 'Nora Avance')).toBe('En camino');
    expect(etiquetaEnRutaKanban('en_ruta', 'en_origen', 'Nora Avance')).toBe('En origen');
    expect(etiquetaEnRutaKanban('en_ruta', 'en_transito', 'Nora Avance')).toBe('En tránsito');
    expect(etiquetaEnRutaKanban('en_ruta', 'en_destino', 'Nora Avance')).toBe('En destino');
    expect(etiquetaEnRutaKanban('en_ruta', 'en_camino_origen', null)).toBe('En camino');
  });

  it('kanban: fuera de EN RUTA no inventa', () => {
    expect(etiquetaEnRutaKanban('agendado', 'asignado', 'Nora Avance')).toBeNull();
    expect(etiquetaEnRutaKanban('en_taller', 'esperando_agenda_vuelta', 'Nora')).toBeNull();
  });

  it('stepper: agendado sin peldaño activo; en camino es el 0', () => {
    expect(indiceStepperEnRuta('agendado', false)).toBe(-1);
    expect(indiceStepperEnRuta('en_camino_origen', false)).toBe(0);
    expect(indiceStepperEnRuta('en_origen', false)).toBe(1);
    expect(indiceStepperEnRuta('en_transito', false)).toBe(2);
    expect(indiceStepperEnRuta('en_destino', false)).toBe(3);
    expect(indiceStepperEnRuta('completado', true)).toBe(4);
  });

  it('combustiblePct y tipo solicitud API', () => {
    expect(combustiblePct('1/2')).toBe(50);
    expect(combustiblePct('Lleno')).toBe(100);
    expect(combustiblePct(null)).toBe(0);
    expect(tipoSolicitudApi('fallido')).toBe('fallido_origen');
    expect(tipoSolicitudApi('reagenda')).toBe('reagenda');
  });

  it('no envía blob: al servidor', () => {
    expect(urlEvidenciaPublicable('blob:http://localhost/x')).toBeNull();
    expect(urlEvidenciaPublicable('data:image/jpeg;base64,abc')).toBe('data:image/jpeg;base64,abc');
  });
});
