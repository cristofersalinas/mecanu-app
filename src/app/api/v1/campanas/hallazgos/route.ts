import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';
import { publicarEventoOportunidad } from '@/lib/slack/oportunidades-flujo';
import type { DatosOportunidad } from '@/lib/slack/oportunidades';

const BodySchema = z.object({
  rutaId: z.string(),
  trasladoId: z.string(),
  testigo: z.string(),
  nivel: z.number().int().min(1).max(4),
  detalle: z.enum(['sin_pegatina', 'vencida', 'por_vencer']).nullable().optional(),
  dias: z.number().int().nullable().optional(),
});

/**
 * POST /api/v1/campanas/hallazgos — testigos ámbar (nivel 2-4) e ITV no hecha /
 * sin pegatina / <60 días. `testigo: "itv"` crea una oferta SV-04 en el mock.
 * Si crea campaña, abre hilo en Slack #oportunidades.
 */
export async function POST(request: Request) {
  return withIdempotency(request, BodySchema, async (body) => {
    const campana = await repo.registrarHallazgoCampana(body);
    if (!campana) return campana;

    const vehiculo = campana.vehiculoId
      ? await repo.getVehiculo(campana.vehiculoId)
      : null;

    const creada = campana.presupuesto.creado ?? campana.fecha;
    const datos: DatosOportunidad = {
      id: campana.id,
      estado: campana.estado,
      valor: campana.valor,
      matricula: vehiculo?.matricula ?? 'Sin matrícula',
      vehiculoLabel: vehiculo
        ? `${vehiculo.marca} ${vehiculo.modelo}`.trim()
        : (campana.servicio?.nombre ?? 'Vehículo'),
      servicioLabel: campana.servicio?.nombre ?? campana.falla ?? 'Oferta',
      creadaEn: creada,
      actualizadaEn: campana.presupuesto.actualizado ?? creada,
      taller: {
        taller: 'Talleres Rodríguez',
        sucursal: 'Talleres Rodríguez · Numància',
      },
    };

    try {
      await publicarEventoOportunidad({
        tipo: 'creada',
        oportunidad: datos,
        actor: { nombre: 'Conductor (check-in)', rol: 'Conductor' },
      });
    } catch (err) {
      console.error('[hallazgos] Slack oportunidad', err);
    }

    return campana;
  });
}
