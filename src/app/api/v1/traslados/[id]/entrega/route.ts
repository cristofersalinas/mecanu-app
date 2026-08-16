import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';

const BodySchema = z.object({
  fotos: z.array(z.object({ slot: z.string(), url: z.string() })).min(2),
  /** obligatoria en devolución (rol vuelta) — la UI la exige antes de llamar; el
      backend real debería cruzar el rol del tramo y rechazar si falta y corresponde. */
  firmaCliente: z.string().nullable(),
});

/** POST /api/v1/traslados/:id/entrega — completa el tramo (entrega en taller o devolución al cliente). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withIdempotency(request, BodySchema, ({ fotos, firmaCliente }) =>
    repo.entregar({ trasladoId: id, fotos, firmaCliente }));
}
