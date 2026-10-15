import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withIdempotency } from '@/lib/mecanu/api-helpers';
import { repo } from '@/lib/mecanu/repo';

const BodySchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().nullable().optional(),
  ts: z.string().datetime().nullable().optional(),
});

/** POST /api/v1/conductores/:id/ubicacion — última vista al abrir la app. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withIdempotency(request, BodySchema, async (body) => {
    await repo.registrarUbicacionConductor({
      conductorId: id,
      lat: body.lat,
      lng: body.lng,
      accuracy: body.accuracy ?? null,
      ts: body.ts ?? null,
    });
    return { ok: true as const };
  });
}
