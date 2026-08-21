import { describe, expect, it } from 'vitest';
import { CAMPANAS, PRESUPUESTOS, servicio } from '../mecanu-rutas';
import { SERVICIO_ITV_ID } from '../oferta-itv';
import { mockRepo } from './repo-mock';

describe('registrarHallazgoCampana: oferta de ITV', () => {
  it('un testigo que no es ITV sigue sin crear campaña', async () => {
    const before = CAMPANAS.length;
    const c = await mockRepo.registrarHallazgoCampana({
      rutaId: 'TR-1055', trasladoId: 'TS-1055-1', testigo: 'presion', nivel: 3,
    });
    expect(c).toBeNull();
    expect(CAMPANAS.length).toBe(before);
  });

  it('ITV no hecha crea oferta SV-04 y no duplica en el mismo vehículo', async () => {
    const nCamp = CAMPANAS.length;
    const nPres = PRESUPUESTOS.length;
    const sv = servicio(SERVICIO_ITV_ID);
    expect(sv).not.toBeNull();
    try {
      const c = await mockRepo.registrarHallazgoCampana({
        rutaId: 'TR-1055',
        trasladoId: 'TS-1055-1',
        testigo: 'itv',
        nivel: 4,
        detalle: 'vencida',
        dias: -12,
      });
      expect(c).not.toBeNull();
      expect(c!.tipos).toContain('itv');
      expect(c!.origenAutomatico).toBe(true);
      expect(c!.presupuesto.lineas.some((l) => l.servicioTemparioId === SERVICIO_ITV_ID)).toBe(true);
      expect(c!.valor).toBeCloseTo(sv!.totalIva, 2);

      const otra = await mockRepo.registrarHallazgoCampana({
        rutaId: 'TR-1055',
        trasladoId: 'TS-1055-1',
        testigo: 'itv',
        nivel: 4,
        detalle: 'sin_pegatina',
      });
      expect(otra!.id).toBe(c!.id);
      expect(CAMPANAS.length).toBe(nCamp + 1);
    } finally {
      CAMPANAS.splice(nCamp);
      PRESUPUESTOS.splice(nPres);
    }
  });

  it('si el vehículo ya tiene una oferta de ITV abierta, la reutiliza', async () => {
    const before = CAMPANAS.length;
    const c = await mockRepo.registrarHallazgoCampana({
      rutaId: 'TR-1041', trasladoId: 'TS-1041-1', testigo: 'itv', nivel: 4, detalle: 'vencida',
    });
    expect(c).not.toBeNull();
    expect((c!.tipos || []).includes('itv')).toBe(true);
    expect(CAMPANAS.length).toBe(before);
  });
});
