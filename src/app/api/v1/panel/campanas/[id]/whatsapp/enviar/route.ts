import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency, ApiError } from '@/lib/mecanu/api-helpers';
import { requirePanelSession } from '@/lib/mecanu/panel-auth';
import { modoContactoOferta, renderSeguimiento } from '@/lib/mecanu/seguimiento-oferta';
import { renderMensaje, valoresOportunidad } from '@/lib/mecanu/mecanu-whatsapp';

const BodySchema = z.object({
  tipo: z.enum(['recordatorio', 'seguimiento', 'text']),
  seleccion: z.array(z.string()).default([]),
  overrides: z.object({
    nombre: z.string().optional(),
    fecha: z.string().optional(),
  }).optional(),
  cuerpo: z.string().optional(),
});

/** POST /api/v1/panel/campanas/:id/whatsapp/enviar — envía por Kapso y persiste el hilo. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requirePanelSession();
  if (denied) return denied;
  const { id } = await params;

  return withIdempotency(request, BodySchema, async (body) => {
    const campana = await repo.getCampana(id);
    if (!campana) throw new ApiError(404, 'not_found', `Campaña ${id} no encontrada`);

    const canal = await repo.getCanalWa(id);
    const modo = modoContactoOferta({ estadoCampana: campana.estado, mensajes: canal.mensajes });
    let tipo = body.tipo;
    if (tipo === 'recordatorio' && modo === 'seguimiento') tipo = 'seguimiento';
    if (tipo === 'recordatorio' && modo === 'responder') {
      throw new ApiError(422, 'modo_responder', 'El cliente escribió: responde con un mensaje de texto.');
    }

    let cuerpo = body.cuerpo;
    if (tipo === 'seguimiento' && !cuerpo?.trim()) {
      const valores = valoresOportunidad(campana, body.seleccion, body.overrides);
      cuerpo = renderSeguimiento(valores);
    }
    if (tipo === 'recordatorio' && !cuerpo?.trim()) {
      const valores = valoresOportunidad(campana, body.seleccion, body.overrides);
      cuerpo = renderMensaje(valores);
    }

    const result = await repo.enviarMensajeWa({
      campanaId: id,
      tipo,
      seleccion: body.seleccion,
      overrides: body.overrides,
      cuerpo,
    });

    return {
      canal: JSON.parse(JSON.stringify(result.canal)),
      mensaje: JSON.parse(JSON.stringify(result.mensaje)),
      campana: JSON.parse(JSON.stringify(result.campana)),
    };
  });
}
