import { NextResponse } from 'next/server';
import { construirVistaFlota, conductorIdsEnServicioTaller } from '@/lib/mecanu/flota-panel';
import { TALLER } from '@/lib/mecanu/mecanu-data';
import { repo } from '@/lib/mecanu/repo';
import { createSupabaseServerAuth } from '@/lib/supabase/auth-server';
import { ensurePerfilPanel } from '@/lib/supabase/ensure-panel-perfil';
import { supabaseServerConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SIN_CACHE = { 'Cache-Control': 'no-store' } as const;

/**
 * GET /api/v1/panel/flota — taller + conductores de ESTE taller con señal
 * o asignados a un servicio abierto (no toda la red Mecanu).
 */
export async function GET() {
  try {
    if (supabaseServerConfigured() && process.env.MECANU_DEMO !== '1') {
      const sb = await createSupabaseServerAuth();
      const { data: { user } } = sb ? await sb.auth.getUser() : { data: { user: null } };
      if (!user) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: SIN_CACHE });
      }
      try {
        await ensurePerfilPanel(user);
      } catch {
        /* perfil best-effort */
      }
    }

    const [conductores, rutas] = await Promise.all([
      repo.listConductores(),
      repo.listRutasVista(),
    ]);

    const rutasAbiertas = rutas.filter((r) => r.estado === 'en_ruta');
    const tramos = (await Promise.all(
      rutasAbiertas.map((r) => repo.listTramosDeRuta(r.id)),
    )).flat();

    const vista = construirVistaFlota({
      tallerDireccion: TALLER.direccion,
      tallerNombre: TALLER.nombre,
      conductores,
      tramos,
      conductorIdsActivos: conductorIdsEnServicioTaller(rutas),
      ahora: new Date(),
    });

    return NextResponse.json({
      taller: vista.taller,
      marcadores: vista.marcadores.map((m) => ({
        ...m,
        actualizadaEn: m.actualizadaEn ? m.actualizadaEn.toISOString() : null,
      })),
    }, { headers: SIN_CACHE });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'flota_error';
    return NextResponse.json({ error: message }, { status: 500, headers: SIN_CACHE });
  }
}
