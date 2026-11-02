import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { ApiError, withIdempotency } from '@/lib/mecanu/api-helpers';
import { exigirConductorSiAplica } from '@/lib/security/sesion-operativa';

const BodySchema = z.object({ conductorId: z.string() });

/** POST /api/v1/traslados/:id/asignar — el conductor toma un traslado de la bolsa de disponibles. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withIdempotency(request, BodySchema, async ({ conductorId }) => {
    const gate = await exigirConductorSiAplica(conductorId);
    if (!gate.ok) throw new ApiError(403, 'forbidden', 'No puedes actuar por otro conductor.');
    return repo.asignarConductor({ trasladoId: id, conductorId: gate.conductorId });
  });
}
