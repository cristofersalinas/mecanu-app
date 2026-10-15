import { NextResponse } from 'next/server';
import { repo } from '@/lib/mecanu/repo';
import { requirePanelSession } from '@/lib/mecanu/panel-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SIN_CACHE = { 'Cache-Control': 'no-store' } as const;

/**
 * Poll ligero del kanban: solo id + estado + subestado.
 * El snapshot completo (~3 s) no puede ser la red de seguridad en vivo.
 */
export async function GET() {
  const denied = await requirePanelSession();
  if (denied) return denied;
  try {
    const rutas = await repo.listRutas();
    return NextResponse.json(
      {
        rutas: rutas.map((r) => ({
          id: r.id,
          estado: r.estado,
          subestado: r.subestado,
        })),
      },
      { headers: SIN_CACHE },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'kanban_error';
    return NextResponse.json({ error: message }, { status: 500, headers: SIN_CACHE });
  }
}
