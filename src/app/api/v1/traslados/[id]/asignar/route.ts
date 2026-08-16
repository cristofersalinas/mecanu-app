import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';

const BodySchema = z.object({ conductorId: z.string() });

/** POST /api/v1/traslados/:id/asignar — el conductor toma un traslado de la bolsa de disponibles. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withIdempotency(request, BodySchema, ({ conductorId }) =>
    repo.asignarConductor({ trasladoId: id, conductorId }));
}
