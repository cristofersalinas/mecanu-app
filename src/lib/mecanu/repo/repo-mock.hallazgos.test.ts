import { describe, expect, it } from 'vitest';
import { CAMPANAS, PRESUPUESTOS } from '../mecanu-rutas';
import { mockRepo } from './repo-mock';

describe('registrarHallazgoCampana: hallazgos de check-in', () => {
  it('testigo ámbar crea campaña con servicio del tempario', async () => {
    const nCamp = CAMPANAS.length;
    const nPres = PRESUPUESTOS.length;
    try {
      const c = await mockRepo.registrarHallazgoCampana({
        rutaId: 'TR-1055',
        trasladoId: 'TS-1055-1',
        testigo: 'presion',
        nivel: 3,
      });
      expect(c).not.toBeNull();
      expect(c!.origenAutomatico).toBe(true);
      expect(c!.tipos).toContain('neumaticos');
      expect(c!.presupuesto.lineas.some((l) => l.servicioTemparioId === 'SV-02')).toBe(true);
    } finally {
      CAMPANAS.splice(nCamp);
      PRESUPUESTOS.splice(nPres);
    }
  });

  it('varios hallazgos de la misma ruta se acumulan en una campaña', async () => {
    const nCamp = CAMPANAS.length;
    const nPres = PRESUPUESTOS.length;
    try {
      const a = await mockRepo.registrarHallazgoCampana({
        rutaId: 'TR-1055',
        trasladoId: 'TS-1055-1',
        testigo: 'item:focos',
        nivel: 3,
      });
      const b = await mockRepo.registrarHallazgoCampana({
        rutaId: 'TR-1055',
        trasladoId: 'TS-1055-1',
        testigo: 'item:plumillas',
        nivel: 2,
      });
      expect(a!.id).toBe(b!.id);
      expect(CAMPANAS.length).toBe(nCamp + 1);
      expect(a!.presupuesto.lineas.length).toBe(2);
      expect(a!.presupuesto.lineas.some((l) => l.servicioTemparioId === 'SV-01')).toBe(true);
      expect(a!.presupuesto.lineas.some((l) => l.servicioTemparioId === 'SV-08')).toBe(true);
    } finally {
      CAMPANAS.splice(nCamp);
      PRESUPUESTOS.splice(nPres);
    }
  });

  it('carrocería crea campaña SV-12', async () => {
    const nCamp = CAMPANAS.length;
    const nPres = PRESUPUESTOS.length;
    try {
      const c = await mockRepo.registrarHallazgoCampana({
        rutaId: 'TR-1055',
        trasladoId: 'TS-1055-1',
        testigo: 'item:carroceria',
        nivel: 4,
      });
      expect(c).not.toBeNull();
      expect(c!.presupuesto.lineas.some((l) => l.servicioTemparioId === 'SV-12')).toBe(true);
    } finally {
      CAMPANAS.splice(nCamp);
      PRESUPUESTOS.splice(nPres);
    }
  });
});
