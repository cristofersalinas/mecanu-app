/**
 * Impersonación mock (backoffice → panel / conductor).
 * Persistencia en sessionStorage. La oleada de auth sustituirá por cookie firmada.
 */
export const IMPERSONATION_KEY = 'mecanu.impersonation.v1';

export type ImpersonationTipo = 'taller' | 'conductor';

export interface ImpersonationContext {
  tipo: ImpersonationTipo;
  usuarioId: string;
  nombre: string;
  tallerId?: string | null;
  conductorId?: string | null;
  actorRealId: string;
  actorRealNombre: string;
  startedAt: string;
}

export type SessionStorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/** Suscripción para useSyncExternalStore. */
export function subscribeImpersonation(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function leerImpersonation(
  storage: SessionStorageLike | null | undefined,
): ImpersonationContext | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(IMPERSONATION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ImpersonationContext;
  } catch {
    return null;
  }
}

export function getImpersonationSnapshot(): ImpersonationContext | null {
  if (typeof window === 'undefined') return null;
  return leerImpersonation(window.sessionStorage);
}

export function getImpersonationServerSnapshot(): ImpersonationContext | null {
  return null;
}

export function escribirImpersonation(
  ctx: ImpersonationContext,
  storage: SessionStorageLike | null | undefined,
): void {
  if (!storage) return;
  storage.setItem(IMPERSONATION_KEY, JSON.stringify(ctx));
  emit();
}

export function limpiarImpersonation(storage: SessionStorageLike | null | undefined): void {
  if (!storage) return;
  storage.removeItem(IMPERSONATION_KEY);
  emit();
}

/** Destino del portal según el contacto. */
export function portalParaContacto(rol: string, conductorId: string | null): {
  tipo: ImpersonationTipo;
  href: string;
} {
  if (rol === 'conductor' || conductorId) {
    return { tipo: 'conductor', href: '/conductor' };
  }
  return { tipo: 'taller', href: '/panel' };
}
