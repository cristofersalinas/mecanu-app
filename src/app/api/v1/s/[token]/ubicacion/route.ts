import { NextResponse } from 'next/server';
import { repo } from '@/lib/mecanu/repo';

/**
 * GET /api/v1/s/:token/ubicacion — posición pública para el mapa de seguimiento.
 * Sin auth: el secreto es el token. Sin trail ni PII.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token: raw } = await params;
  const token = decodeURIComponent(raw ?? '').trim();
  if (!token) {
    return NextResponse.json(
      { error: { code: 'not_found', message: 'Token vacío.' } },
      { status: 404 },
    );
  }
  try {
    const data = await repo.getUbicacionSeguimientoPublico(token);
    if (!data) {
      return NextResponse.json(
        { error: { code: 'not_found', message: 'Enlace de seguimiento no válido.' } },
        { status: 404 },
      );
    }
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: { code: 'internal_error', message: 'Error inesperado del servidor.' } },
      { status: 500 },
    );
  }
}
