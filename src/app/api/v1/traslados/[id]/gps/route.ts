import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';

const BodySchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().nullable().optional(),
  heading: z.number().nullable().optional(),
  speed: z.number().nullable().optional(),
  ts: z.string().datetime().nullable().optional(),
});

/** POST /api/v1/traslados/:id/gps — ping de ubicación del conductor. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withIdempotency(request, BodySchema, (body) =>
    repo.registrarGpsTramo({
      trasladoId: id,
      lat: body.lat,
      lng: body.lng,
      accuracy: body.accuracy ?? null,
      heading: body.heading ?? null,
      speed: body.speed ?? null,
      ts: body.ts ?? null,
      fuente: 'conductor',
    }),
  );
}
