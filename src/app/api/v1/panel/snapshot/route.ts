import { NextResponse } from 'next/server';
import { repo } from '@/lib/mecanu/repo';
import { createSupabaseServerAuth } from '@/lib/supabase/auth-server';
import { ensurePerfilPanel } from '@/lib/supabase/ensure-panel-perfil';
import { supabaseServerConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SIN_CACHE = { 'Cache-Control': 'no-store' } as const;

/**
 * Snapshot del panel para hidratar el store cuando MECANU_USE_SUPABASE=1.
 * Con Supabase configurado (y sin demo) exige sesión. Sin cache: el kanban
 * en vivo reconsulta esto y un GET cacheado dejaría la tarjeta en el estado viejo.
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

    const [rutas, campanas, clientes, vehiculos, conductores, servicios] = await Promise.all([
      repo.listRutasVista(),
      repo.listCampanas(),
      repo.listClientes(),
      repo.listVehiculos(),
      repo.listConductores(),
      repo.listServicios(),
    ]);

    return NextResponse.json({
      rutas: JSON.parse(JSON.stringify(rutas)),
      campanas: JSON.parse(JSON.stringify(campanas)),
      clientes: JSON.parse(JSON.stringify(clientes)),
      vehiculos: JSON.parse(JSON.stringify(vehiculos)),
      conductores: JSON.parse(JSON.stringify(conductores)),
      servicios: JSON.parse(JSON.stringify(servicios)),
    }, { headers: SIN_CACHE });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'snapshot_error';
    return NextResponse.json({ error: message }, { status: 500, headers: SIN_CACHE });
  }
}
