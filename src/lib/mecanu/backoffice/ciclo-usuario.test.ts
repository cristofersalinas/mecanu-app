import { describe, expect, it } from 'vitest';
import { puede } from './reglas';
import { invitarUsuario, puedeEntrarAppConductor, transicionarUsuario } from './ciclo-usuario';
import type { UsuarioBackoffice } from '../types';

function dueno(over: Partial<UsuarioBackoffice> = {}): UsuarioBackoffice {
  return {
    id: 'u-dueno',
    nombre: 'Cristofer',
    email: 'crist@mecanu.com',
    telefono: null,
    documento: null,
    rol: 'dueno',
    estado: 'activo',
    conductorId: null,
    invitadEn: new Date('2026-01-01'),
    activadoEn: new Date('2026-01-01'),
    ...over,
  };
}

describe('Permisos del backoffice', () => {
  it('el dueño resuelve solicitudes, asigna y gestiona usuarios', () => {
    expect(puede('dueno', 'resolver_solicitud')).toBe(true);
    expect(puede('dueno', 'gestionar_usuarios')).toBe(true);
  });

  it('operación cubre el día a día pero no invita ni da de baja', () => {
    expect(puede('operacion', 'resolver_solicitud')).toBe(true);
    expect(puede('operacion', 'asignar_conductor')).toBe(true);
    expect(puede('operacion', 'gestionar_usuarios')).toBe(false);
  });

  it('un conductor no entra al backoffice', () => {
    expect(puede('conductor', 'ver_backoffice')).toBe(false);
  });
});

describe('Ciclo de vida de un usuario interno', () => {
  it('invitar → activo → suspendido → activo', () => {
    const users = [dueno()];
    const inv = invitarUsuario(users, {
      nombre: 'Rubén Ortega',
      email: 'ruben@taller.es',
      rol: 'operacion',
    }, new Date('2026-08-01'));
    expect(inv.estado).toBe('invitado');
    transicionarUsuario(users, inv.id, 'activo', new Date('2026-08-02'));
    expect(inv.estado).toBe('activo');
    expect(inv.activadoEn).toEqual(new Date('2026-08-02'));
    transicionarUsuario(users, inv.id, 'suspendido', new Date());
    transicionarUsuario(users, inv.id, 'activo', new Date());
    expect(inv.estado).toBe('activo');
  });

  it('no se da de baja al último dueño activo', () => {
    const users = [dueno()];
    expect(() => transicionarUsuario(users, 'u-dueno', 'baja', new Date())).toThrow(/último dueño/);
  });

  it('con un segundo dueño sí se puede dar de baja al primero', () => {
    const users = [dueno(), dueno({ id: 'u-dueno-2', email: 'otro@mecanu.com' })];
    transicionarUsuario(users, 'u-dueno', 'baja', new Date());
    expect(users[0].estado).toBe('baja');
  });

  it('no se invita con un email mal formado', () => {
    const users = [dueno()];
    expect(() => invitarUsuario(users, {
      nombre: 'X', email: 'sin-arroba', rol: 'operacion',
    }, new Date())).toThrow(/email/);
  });

  it('no se invita dos veces el mismo email vivo', () => {
    const users = [dueno()];
    expect(() => invitarUsuario(users, {
      nombre: 'X', email: 'crist@mecanu.com', rol: 'operacion',
    }, new Date())).toThrow(/email/);
  });

  it('el PWA del conductor exige usuario conductor activo', () => {
    expect(puedeEntrarAppConductor(dueno())).toBe(false);
    expect(puedeEntrarAppConductor({
      ...dueno(), id: 'u-d1', rol: 'conductor', conductorId: 'd1', estado: 'suspendido',
    })).toBe(false);
    expect(puedeEntrarAppConductor({
      ...dueno(), id: 'u-d1', rol: 'conductor', conductorId: 'd1', estado: 'activo',
    })).toBe(true);
  });
});
