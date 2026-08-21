import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';
import { requirePanelSession } from '@/lib/mecanu/panel-auth';

const BodySchema = z.object({
  campanaId: z.string().min(1),
  modo: z.enum(['tal_cual', 'editar_lineas', 'solo_total']),
  lineas: z.array(z.object({
    descripcion: z.string(),
    importe: z.number(),
    origen: z.string(),
  })).optional(),
  tipoServicio: z.string().min(1),
  fecha: z.string().datetime().nullable(),
  franja: z.string().nullable(),
});

/** POST /api/v1/panel/rutas/desde-campana */
export async function POST(request: Request) {
  const denied = await requirePanelSession();
  if (denied) return denied;
  return withIdempotency(request, BodySchema, async (body) => {
    const ruta = await repo.crearRutaDesdeCampana({
      campanaId: body.campanaId,
      modo: body.modo,
      lineas: body.lineas,
      tipoServicio: body.tipoServicio,
      fecha: body.fecha ? new Date(body.fecha) : null,
      franja: body.franja,
    });
    const vista = await repo.getRutaVista(ruta.id);
    return { ruta, vista };
  });
}
