import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';
import { requirePanelSession } from '@/lib/mecanu/panel-auth';

const BodySchema = z.object({
  conductorId: z.string().nullable(),
});

/** POST /api/v1/panel/rutas/:id/asignar-conductor */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requirePanelSession();
  if (denied) return denied;
  const { id } = await params;
  return withIdempotency(request, BodySchema, async (body) => {
    const ruta = await repo.asignarConductorRuta(id, body.conductorId);
    const vista = await repo.getRutaVista(ruta.id);
    return { ruta, vista };
  });
}
