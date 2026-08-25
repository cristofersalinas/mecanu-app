import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';

const BodySchema = z.object({
  a: z.enum(['en_camino_origen', 'en_origen', 'en_transito', 'en_destino']),
  triggerSource: z.enum(['manual', 'conductor', 'api', 'cron']).default('conductor'),
});

/** POST /api/v1/traslados/:id/subestado — avance de EN_RUTA (R7: lo dispara el conductor).
 *  También promociona `ruta.estado` a `en_ruta` (y copia el subestado) si `a` es un peldaño. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withIdempotency(request, BodySchema, ({ a, triggerSource }) =>
    repo.cambiarSubestadoTramo({ trasladoId: id, a, triggerSource }));
}
