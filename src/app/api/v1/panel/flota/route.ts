import { NextResponse } from 'next/server';
import {
  construirVistaFlota,
  esEstadoFlotaMapa,
  type RutaFlotaInput,
} from '@/lib/mecanu/flota-panel';
import { etiquetaVehiculo, TALLER } from '@/lib/mecanu/mecanu-data';
import { repo } from '@/lib/mecanu/repo';
import { createSupabaseServerAuth } from '@/lib/supabase/auth-server';
import { ensurePerfilPanel } from '@/lib/supabase/ensure-panel-perfil';
import { supabaseServerConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SIN_CACHE = { 'Cache-Control': 'no-store' } as const;

/**
 * GET /api/v1/panel/flota — autos en_ruta o en_taller del taller
 * (marcadores para el mapa del General).
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

    const [conductores, rutas, vehiculos] = await Promise.all([
      repo.listConductores(),
      repo.listRutasVista(),
      repo.listVehiculos(),
    ]);

    const conductorById = new Map(conductores.map((c) => [c.id, c]));
    const vehiculoById = new Map(vehiculos.map((v) => [v.id, v]));

    const activas = rutas.filter((r) => esEstadoFlotaMapa(r.estado));
    const tramos = (await Promise.all(
      activas.map((r) => repo.listTramosDeRuta(r.id)),
    )).flat();

    const rutasFlota: RutaFlotaInput[] = activas.map((r) => {
      const v = r.vehiculoId ? vehiculoById.get(r.vehiculoId) : null;
      const c = r.conductorId ? conductorById.get(r.conductorId) : null;
      const vehiculoLabel = v
        ? `${v.matricula} · ${etiquetaVehiculo(v)}`
        : (r.matriculaLead ? `${r.matriculaLead} · ${r.id}` : r.id);
      const direccionCard = r.estado === 'en_taller'
        ? TALLER.direccion
        : (r.direccionOrigen ?? r.direccion ?? TALLER.direccion);
      return {
        id: r.id,
        estado: r.estado,
        conductorId: r.conductorId,
        vehiculoLabel,
        conductorNombre: c?.nombre ?? null,
        direccionCard,
        marca: v?.marca ?? null,
        modelo: v?.modelo ?? null,
      };
    });

    const vista = construirVistaFlota({
      tallerDireccion: TALLER.direccion,
      tallerNombre: TALLER.nombre,
      rutas: rutasFlota,
      conductores,
      tramos,
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
