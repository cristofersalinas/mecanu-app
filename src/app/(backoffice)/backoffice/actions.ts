'use server';

import { revalidatePath } from 'next/cache';
import { repo } from '@/lib/mecanu/repo';
import type { EstadoSolicitud, EstadoUsuarioBackoffice, ProcesoConductor } from '@/lib/mecanu/types';
import { sesionOperativaObligatoria } from '@/lib/security/sesion-operativa';
import { createSupabaseServerAuth } from '@/lib/supabase/auth-server';
import { ACTOR_BACKOFFICE } from './session';

async function exigirSesionBackoffice(): Promise<void> {
  if (!sesionOperativaObligatoria()) return;
  const sb = await createSupabaseServerAuth();
  const { data: { user } } = sb ? await sb.auth.getUser() : { data: { user: null } };
  if (!user) throw new Error('Sesión requerida.');
}

export async function resolverSolicitudAction(id: string, resolucion: string, estado: EstadoSolicitud) {
  await exigirSesionBackoffice();
  if (!resolucion.trim()) throw new Error('La resolución es obligatoria');
  await repo.resolverSolicitud(id, resolucion.trim(), estado);
  revalidatePath('/backoffice');
}

export async function asignarHuecoAction(tramoId: string, conductorId: string) {
  await exigirSesionBackoffice();
  await repo.reasignarConductorTramo({ tramoId, conductorId });
  revalidatePath('/backoffice');
}

export async function ejecutarCronAction() {
  await exigirSesionBackoffice();
  await repo.ejecutarAutomatizacionesBackoffice(ACTOR_BACKOFFICE);
  revalidatePath('/backoffice');
}

export async function transicionarUsuarioAction(usuarioId: string, hacia: EstadoUsuarioBackoffice) {
  await exigirSesionBackoffice();
  await repo.transicionarUsuarioBackoffice(ACTOR_BACKOFFICE, usuarioId, hacia);
  revalidatePath('/backoffice');
}

export async function transicionarProcesoAction(conductorId: string, hacia: ProcesoConductor) {
  await exigirSesionBackoffice();
  await repo.transicionarProcesoConductor(ACTOR_BACKOFFICE, conductorId, hacia);
  revalidatePath('/backoffice');
}

export async function invitarUsuarioAction(form: {
  nombre: string; email: string; rol: 'operacion' | 'conductor'; conductorId?: string | null;
}) {
  await exigirSesionBackoffice();
  await repo.invitarUsuarioBackoffice(ACTOR_BACKOFFICE, form);
  revalidatePath('/backoffice');
}
