'use server';

import { revalidatePath } from 'next/cache';
import { repo } from '@/lib/mecanu/repo';
import type { EstadoSolicitud, EstadoUsuarioBackoffice, ProcesoConductor } from '@/lib/mecanu/types';
import { ACTOR_BACKOFFICE } from './session';

export async function resolverSolicitudAction(id: string, resolucion: string, estado: EstadoSolicitud) {
  if (!resolucion.trim()) throw new Error('La resolución es obligatoria');
  await repo.resolverSolicitud(id, resolucion.trim(), estado);
  revalidatePath('/backoffice');
}

export async function asignarHuecoAction(tramoId: string, conductorId: string) {
  await repo.reasignarConductorTramo({ tramoId, conductorId });
  revalidatePath('/backoffice');
}

export async function ejecutarCronAction() {
  await repo.ejecutarAutomatizacionesBackoffice(ACTOR_BACKOFFICE);
  revalidatePath('/backoffice');
}

export async function transicionarUsuarioAction(usuarioId: string, hacia: EstadoUsuarioBackoffice) {
  await repo.transicionarUsuarioBackoffice(ACTOR_BACKOFFICE, usuarioId, hacia);
  revalidatePath('/backoffice');
}

export async function transicionarProcesoAction(conductorId: string, hacia: ProcesoConductor) {
  await repo.transicionarProcesoConductor(ACTOR_BACKOFFICE, conductorId, hacia);
  revalidatePath('/backoffice');
}

export async function invitarUsuarioAction(form: {
  nombre: string; email: string; rol: 'operacion' | 'conductor'; conductorId?: string | null;
}) {
  await repo.invitarUsuarioBackoffice(ACTOR_BACKOFFICE, form);
  revalidatePath('/backoffice');
}
