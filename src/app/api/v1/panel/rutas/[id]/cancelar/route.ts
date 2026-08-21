import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';
import { requirePanelSession } from '@/lib/mecanu/panel-auth';

const BodySchema = z.object({
  subestado: z.enum(['por_cliente', 'por_taller', 'fallido_origen', 'fallido_ruta']),
  motivo: z.string().min(1),
});

/** POST /api/v1/panel/rutas/:id/cancelar */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requirePanelSession();
  if (denied) return denied;
  const { id } = await params;
  return withIdempotency(request, BodySchema, async (body) => {
    const ruta = await repo.cancelarRuta({ rutaId: id, ...body });
    return { ruta };
  });
}
