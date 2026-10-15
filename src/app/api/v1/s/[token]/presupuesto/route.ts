import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { mockRepo } from '@/lib/mecanu/repo/repo-mock';

const BodySchema = z.object({
  accion: z.enum(['aceptar', 'rechazar']),
  indices: z.array(z.number().int().nonnegative()).default([]),
});

/**
 * POST /api/v1/s/:token/presupuesto — el cliente acepta o rechaza la cotización
 * desde la pestaña Presupuesto del seguimiento público.
 */
export async function POST(
  request: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token: raw } = await ctx.params;
  const token = decodeURIComponent(raw || '').trim();
  if (!token) {
    return Response.json(
      { error: { code: 'bad_request', message: 'Token vacío' } },
      { status: 400 },
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await request.json());
  } catch {
    return Response.json(
      { error: { code: 'bad_request', message: 'Cuerpo inválido' } },
      { status: 400 },
    );
  }

  const intentar = async (fuente: typeof repo) => {
    return fuente.responderPresupuestoSeguimiento({
      token,
      accion: body.accion,
      indices: body.indices,
    });
  };

  try {
    try {
      const out = await intentar(repo);
      return Response.json(out);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('no válido') || msg.includes('No hay cotización')) {
        const out = await intentar(mockRepo);
        return Response.json(out);
      }
      throw e;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'presupuesto_error';
    const status = /no válido|no encontrada|cerrada|Selecciona/i.test(message) ? 400 : 500;
    return Response.json(
      { error: { code: status === 400 ? 'bad_request' : 'server_error', message } },
      { status },
    );
  }
}
