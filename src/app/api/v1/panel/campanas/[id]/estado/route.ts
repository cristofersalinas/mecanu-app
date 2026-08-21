import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';
import { requirePanelSession } from '@/lib/mecanu/panel-auth';

const BodySchema = z.object({
  estado: z.enum(['nueva', 'valorada', 'enviada', 'aceptada', 'rechazada', 'caducada']),
});

/** POST /api/v1/panel/campanas/:id/estado — actualiza presupuesto ligado. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requirePanelSession();
  if (denied) return denied;
  const { id } = await params;
  return withIdempotency(request, BodySchema, async (body) => {
    const campana = await repo.getCampana(id);
    if (!campana) throw new Error(`Campaña ${id} no encontrada`);
    await repo.cambiarEstadoPresupuesto({
      presupuestoId: campana.presupuesto.id,
      estado: body.estado,
    });
    const actualizada = await repo.getCampana(id);
    return { campana: actualizada };
  });
}
