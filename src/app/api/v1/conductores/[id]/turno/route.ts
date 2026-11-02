import { NextResponse } from 'next/server';
import { repo } from '@/lib/mecanu/repo';
import { exigirConductorSiAplica } from '@/lib/security/sesion-operativa';

/** GET /api/v1/conductores/:id/turno?dia=hoy — el reparto del día lo decide el taller. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gate = await exigirConductorSiAplica(id);
  if (!gate.ok) return gate.respuesta;
  const turno = await repo.getTurnoConductor(gate.conductorId);
  return NextResponse.json(turno);
}
