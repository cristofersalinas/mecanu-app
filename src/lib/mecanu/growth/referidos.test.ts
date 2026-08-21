import { describe, expect, it } from 'vitest';
import { copyDondeInvitarDespues, validarEmailInvitacion, validarReferido } from './referidos';

describe('Referidos e invitaciones', () => {
  it('pide nombre y teléfono creíbles', () => {
    expect(validarReferido({
      nombre: 'A', telefono: '600', tipo: 'interna', quienRecomiendaId: 'd1',
    })).toMatch(/nombre|teléfono/);
    expect(validarReferido({
      nombre: 'Luis Pérez', telefono: '600 111 222', tipo: 'externa', quienRecomiendaId: 'd1',
    })).toBeNull();
  });

  it('valida el email del colaborador', () => {
    expect(validarEmailInvitacion('no')).toMatch(/email/);
    expect(validarEmailInvitacion('ruben@taller.es')).toBeNull();
  });

  it('si dice a nadie, indica dónde invitar después', () => {
    expect(copyDondeInvitarDespues()).toMatch(/Disponibles/);
  });
});
