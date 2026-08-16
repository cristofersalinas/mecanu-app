import { NextResponse } from 'next/server';
import { repo } from '@/lib/mecanu/repo';

/**
 * GET /api/v1/solicitudes — bandeja del taller (HANDOFF.md §7.3). Devuelve las solicitudes
 * `pendiente` que el conductor ha creado (reagenda/rechazo/fallido_origen/no_rodante).
 * Este endpoint es del PANEL, no del conductor — el panel puede llamarlo vía fetch aquí o,
 * más idiomático en este proyecto, vía Server Action (ver ARQUITECTURA.md). Se deja como
 * API route también porque HANDOFF.md lo describe como recurso propio y es útil para
 * integraciones futuras (notificaciones push, etc.).
 */
export async function GET() {
  const solicitudes = await repo.listSolicitudesPendientes();
  return NextResponse.json({ solicitudes });
}
