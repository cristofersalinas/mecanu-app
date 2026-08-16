import { NextResponse } from 'next/server';
import { repo } from '@/lib/mecanu/repo';

/**
 * GET /api/v1/traslados/disponibles — bolsa de traslados que el taller deja libres.
 * // TODO API: hoy no hay un criterio real de "disponible" en el modelo — el mock del
 * // conductor (`src/components/conductor/constants.ts`, `POOL`) lo hardcodea. El backend
 * // real necesita una columna/estado explícito (`traslados.disponible boolean` o similar)
 * // que el taller pueda activar. Ver PREGUNTAS-ABIERTAS.md.
 */
export async function GET() {
  const disponibles = await repo.getTrasladosDisponibles();
  return NextResponse.json(disponibles);
}
