import type { EstadoUsuarioBackoffice, RolBackoffice, UsuarioBackoffice } from '../types';

const SIGUIENTE: Record<EstadoUsuarioBackoffice, EstadoUsuarioBackoffice[]> = {
  invitado: ['activo', 'baja'],
  activo: ['suspendido', 'baja'],
  suspendido: ['activo', 'baja'],
  baja: [],
};

export function puedeTransicionarUsuario(
  desde: EstadoUsuarioBackoffice,
  hacia: EstadoUsuarioBackoffice,
): boolean {
  return SIGUIENTE[desde].includes(hacia);
}

export function ultimoDuenoActivo(usuarios: UsuarioBackoffice[], exceptoId?: string): boolean {
  const duenos = usuarios.filter(
    (u) => u.rol === 'dueno' && u.estado === 'activo' && u.id !== exceptoId,
  );
  return duenos.length === 0;
}

export function transicionarUsuario(
  usuarios: UsuarioBackoffice[],
  id: string,
  hacia: EstadoUsuarioBackoffice,
  ahora: Date,
): UsuarioBackoffice {
  const u = usuarios.find((x) => x.id === id);
  if (!u) throw new Error(`Usuario ${id} no encontrado`);
  if (!puedeTransicionarUsuario(u.estado, hacia)) {
    throw new Error(`No se puede pasar de ${u.estado} a ${hacia}`);
  }
  if (hacia === 'baja' && u.rol === 'dueno' && ultimoDuenoActivo(usuarios, id)) {
    throw new Error('No puedes dar de baja al último dueño activo');
  }
  u.estado = hacia;
  if (hacia === 'activo' && !u.activadoEn) u.activadoEn = ahora;
  return u;
}

export function invitarUsuario(
  usuarios: UsuarioBackoffice[],
  input: { nombre: string; email: string; rol: RolBackoffice; telefono?: string | null; conductorId?: string | null },
  ahora: Date,
): UsuarioBackoffice {
  const email = input.email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('El email no es válido');
  if (usuarios.some((u) => u.email.toLowerCase() === email && u.estado !== 'baja')) {
    throw new Error('Ya hay un usuario con ese email');
  }
  if (input.rol === 'conductor' && !input.conductorId) {
    throw new Error('Un usuario conductor tiene que ir ligado a un conductor del modelo');
  }
  const creado: UsuarioBackoffice = {
    id: `u-${Math.random().toString(36).slice(2, 8)}`,
    nombre: input.nombre.trim(),
    email,
    telefono: input.telefono ?? null,
    documento: null,
    rol: input.rol,
    estado: 'invitado',
    conductorId: input.conductorId ?? null,
    invitadEn: ahora,
    activadoEn: null,
  };
  usuarios.push(creado);
  return creado;
}

/** El PWA del conductor solo abre si el usuario interno está activo. */
export function puedeEntrarAppConductor(u: UsuarioBackoffice | null): boolean {
  return !!u && u.rol === 'conductor' && u.estado === 'activo';
}
