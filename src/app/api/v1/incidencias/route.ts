import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';

const BodySchema = z.object({
  trasladoId: z.string(),
  tipo: z.literal('siniestro'),
  detalle: z.string().nullable(),
});

/** POST /api/v1/incidencias — reporte de siniestro (IncidentButton, hold-to-activate). Congela el tramo. */
export async function POST(request: Request) {
  return withIdempotency(request, BodySchema, async ({ trasladoId, tipo, detalle }) => {
    await repo.registrarIncidencia({ trasladoId, tipo, origen: 'conductor', detalle });
    return { ok: true };
  });
}
