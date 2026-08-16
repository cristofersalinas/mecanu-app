import { z } from 'zod';
import { repo } from '@/lib/mecanu/repo';
import { withIdempotency } from '@/lib/mecanu/api-helpers';

const BodySchema = z.object({ km: z.number().int().nonnegative() });

/**
 * PATCH /api/v1/vehiculos/:id — el km vive en el VEHÍCULO, no en el traslado (HANDOFF.md §7.2).
 * El backend real debe avisar (no bloquear) si el km entrante es menor que el actual.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withIdempotency(request, BodySchema, ({ km }) => repo.actualizarKmVehiculo(id, km));
}
