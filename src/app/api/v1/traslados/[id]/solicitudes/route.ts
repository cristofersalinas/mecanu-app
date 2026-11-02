import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { ApiError, withIdempotency } from '@/lib/mecanu/api-helpers';
import { exigirConductorSiAplica } from '@/lib/security/sesion-operativa';

const BodySchema = z.object({
  rutaId: z.string(),
  conductorId: z.string(),
  tipo: z.enum(['reagenda', 'rechazo', 'fallido_origen', 'no_rodante']),
  motivo: z.string().min(1),
  nota: z.string().nullable(),
  ventanaActual: z.string().nullable(),
  conflictoCon: z.string().nullable(),
  evidenciaIds: z.array(z.string()).default([]),
});

/**
 * POST /api/v1/traslados/:id/solicitudes — el conductor PROPONE, el taller EJECUTA (§4.4 de
 * HANDOFF.md). Esta llamada nunca cambia la ventana/fecha directamente (R6): solo crea la
 * solicitud en la bandeja del taller (`GET /api/v1/solicitudes`, panel).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withIdempotency(request, BodySchema, async (body) => {
    const gate = await exigirConductorSiAplica(body.conductorId);
    if (!gate.ok) throw new ApiError(403, 'forbidden', 'No puedes actuar por otro conductor.');
    return repo.crearSolicitud({ trasladoId: id, ...body, conductorId: gate.conductorId });
  });
}
