import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';

const BodySchema = z.object({
  km: z.number().int().nonnegative(),
  combustible: z.string(),
  combustiblePct: z.number().min(0).max(100),
  limpieza: z.string(),
  fotos: z.array(z.object({ slot: z.string(), url: z.string() })).min(4),
  videoUrl: z.string().nullable(),
  testigos: z.record(z.string(), z.boolean()),
  itemsInspeccion: z.record(z.string(), z.number().int().min(1).max(4)),
  ruedas: z.record(z.string(), z.number().int().min(1).max(4)),
  nota: z.string().nullable(),
  notaVozUrl: z.string().nullable(),
  firmaConductor: z.string().nullable(),
});

/**
 * POST /api/v1/traslados/:id/checkin — evidencia de recogida, sellada e inmutable.
 * R4 (gate de evidencia): el cliente NO debe llamar esto sin las 4 fotos mínimas — el
 * schema ya lo exige (`fotos.min(4)`), pero la UI es la primera línea de defensa.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withIdempotency(request, BodySchema, (body) => repo.checkin({ trasladoId: id, ...body }));
}
