import { describe, expect, it } from 'vitest';
import { mockRepo } from './repo-mock';

describe('Backoffice sobre el mock real', () => {
  it('el dueño ve alertas de la bandeja sembrada (no rodante fuera de SLA)', async () => {
    const snap = await mockRepo.getBackofficeSnapshot('u-dueno');
    expect(snap.actor.rol).toBe('dueno');
    expect(snap.solicitudes.some((s) => s.tipo === 'no_rodante' && s.estado === 'pendiente')).toBe(true);
    expect(snap.alertas.some((a) => a.severidad === 'critica')).toBe(true);
    expect(snap.analitica.facturadoCerradoLabel).toMatch(/€/);
  });

  it('un conductor no puede invitar', async () => {
    const conductores = await mockRepo.listUsuariosBackoffice();
    const cond = conductores.find((u) => u.rol === 'conductor' && u.estado === 'activo');
    expect(cond).toBeTruthy();
    await expect(mockRepo.invitarUsuarioBackoffice(cond!.id, {
      nombre: 'X', email: 'x@mecanu.com', rol: 'operacion',
    })).rejects.toThrow(/invitar|activo|Usuario/);
  });
});
