import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';

const BodySchema = z.object({
  estado: z.enum(['resuelta_reagenda', 'resuelta_reasignada', 'resuelta_cancelada', 'descartada']),
  /** texto que el conductor lee, p.ej. "Reagendado a 16:00-17:00" */
  resolucion: z.string().min(1),
});

/** POST /api/v1/solicitudes/:id/resolver — el taller resuelve una solicitud del conductor. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withIdempotency(request, BodySchema, ({ estado, resolucion }) =>
    repo.resolverSolicitud(id, resolucion, estado));
}
