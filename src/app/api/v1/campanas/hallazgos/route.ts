import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';

const BodySchema = z.object({
  rutaId: z.string(),
  trasladoId: z.string(),
  testigo: z.string(),
  nivel: z.number().int().min(1).max(4),
});

/**
 * POST /api/v1/campanas/hallazgos — testigos ámbar (nivel 2-4) e ITV <60 días crean/alimentan
 * una campaña automáticamente. Ver `campanaDesdeInspeccion` en `mecanu-rutas.ts` para la lógica
 * de mock equivalente hoy.
 */
export async function POST(request: Request) {
  return withIdempotency(request, BodySchema, (body) => repo.registrarHallazgoCampana(body));
}
