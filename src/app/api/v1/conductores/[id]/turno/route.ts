import { NextResponse } from 'next/server';
import { repo } from '@/lib/mecanu/repo';

/** GET /api/v1/conductores/:id/turno?dia=hoy — el reparto del día lo decide el taller. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const turno = await repo.getTurnoConductor(id);
  return NextResponse.json(turno);
}
