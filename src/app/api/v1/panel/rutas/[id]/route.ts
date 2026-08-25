import { NextResponse } from 'next/server';
import { repo } from '@/lib/mecanu/repo';
import { requirePanelSession } from '@/lib/mecanu/panel-auth';

/** GET /api/v1/panel/rutas/:id — lectura de una ruta persistida (estado incluido). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requirePanelSession();
  if (denied) return denied;
  const { id } = await params;
  try {
    const ruta = await repo.getRuta(id);
    if (!ruta) {
      return NextResponse.json(
        { error: { code: 'not_found', message: 'Ruta no encontrada.' } },
        { status: 404 },
      );
    }
    return NextResponse.json({ ruta: JSON.parse(JSON.stringify(ruta)) });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: { code: 'internal_error', message: 'Error inesperado del servidor.' } },
      { status: 500 },
    );
  }
}
