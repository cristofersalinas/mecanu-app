import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';

const BodySchema = z.object({
  tipo: z.literal('llegada_a_tiempo'),
  nota: z.string().nullable(),
  origen: z.enum(['conductor', 'cliente', 'api']),
});

/** POST /api/v1/traslados/:id/confirmaciones — informativa, no bloquea (a diferencia de las solicitudes). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withIdempotency(request, BodySchema, async (body) => {
    await repo.registrarConfirmacion({ trasladoId: id, ...body });
    return { ok: true };
  });
}
