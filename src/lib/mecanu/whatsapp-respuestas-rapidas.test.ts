import { describe, expect, it } from 'vitest';
import { RESPUESTAS_RAPIDAS, sugerenciasRapidas } from './whatsapp-respuestas-rapidas';

describe('sugerenciasRapidas', () => {
  it('prioriza traslado y presupuesto según contexto', () => {
    const s = sugerenciasRapidas(
      { impulsoTraslado: true, tienePresupuestoPendiente: true },
      3,
      new Set(),
    );
    expect(s.length).toBe(3);
    expect(s.some((x) => x.intencion.includes('traslado') || x.intencion === 'presupuesto' || x.intencion === 'seguimiento_presupuesto')).toBe(
      true,
    );
  });

  it('oculta las ya usadas en la sesión', () => {
    const usadas = new Set(RESPUESTAS_RAPIDAS.slice(0, 5).map((r) => r.id));
    const s = sugerenciasRapidas({}, 4, usadas);
    expect(s.every((x) => !usadas.has(x.id))).toBe(true);
  });

  it('si se agotan, vuelve a ofrecer el catálogo', () => {
    const todas = new Set(RESPUESTAS_RAPIDAS.map((r) => r.id));
    const s = sugerenciasRapidas({}, 3, todas);
    expect(s.length).toBe(3);
  });
});
