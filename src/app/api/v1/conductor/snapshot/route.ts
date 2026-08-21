import { NextResponse } from 'next/server';
import { repo } from '@/lib/mecanu/repo';
import type { Tramo } from '@/lib/mecanu/types';
import { createSupabaseServerAuth } from '@/lib/supabase/auth-server';
import { supabaseServerConfigured } from '@/lib/supabase/server';

/**
 * Snapshot del conductor para hidratar turno + entidades cuando USE_SUPABASE.
 * ?conductorId=d1 (default d1).
 */
export async function GET(request: Request) {
  try {
    if (supabaseServerConfigured() && process.env.MECANU_DEMO !== '1') {
      const sb = await createSupabaseServerAuth();
      const { data: { user } } = sb ? await sb.auth.getUser() : { data: { user: null } };
      if (!user) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
    }

    const url = new URL(request.url);
    const conductorId = url.searchParams.get('conductorId') || 'd1';

    const [turno, disponibles] = await Promise.all([
      repo.getTurnoConductor(conductorId),
      repo.getTrasladosDisponibles(),
    ]);

    const ids = [...new Set([...turno.trasladoIds, ...disponibles.trasladoIds])];
    const tramos: Tramo[] = [];
    const rutasMap = new Map<string, { id: string; vehiculoId: string | null; matriculaLead: string | null }>();
    const vehiculosMap = new Map<string, { id: string; matricula: string; marca: string; modelo: string; km: number }>();
    const paradas: unknown[] = [];
    const clientesPorVehiculo: Record<string, unknown[]> = {};

    for (const tid of ids) {
      const t = await repo.getTramo(tid);
      if (!t) continue;
      tramos.push(t);
      if (!rutasMap.has(t.rutaId)) {
        const r = await repo.getRuta(t.rutaId);
        if (r) rutasMap.set(r.id, {
          id: r.id,
          vehiculoId: r.vehiculoId,
          matriculaLead: r.matriculaLead,
        });
        const ps = await repo.listParadasDeRuta(t.rutaId);
        for (const p of ps) {
          paradas.push({
            id: p.id,
            rutaId: p.rutaId,
            orden: p.orden,
            tipo: p.tipo,
            etiqueta: p.etiqueta,
            direccion: p.direccion,
          });
        }
        if (r?.vehiculoId && !vehiculosMap.has(r.vehiculoId)) {
          const v = await repo.getVehiculo(r.vehiculoId);
          if (v) {
            vehiculosMap.set(v.id, {
              id: v.id,
              matricula: v.matricula,
              marca: v.marca,
              modelo: v.modelo,
              km: v.km,
            });
          }
        }
      }
    }

    const vehiculosAll = await repo.listVehiculos();
    const clientesAll = await repo.listClientes();
    for (const vid of vehiculosMap.keys()) {
      const full = vehiculosAll.find((x) => x.id === vid);
      if (full?.usuarios?.length) {
        clientesPorVehiculo[vid] = full.usuarios.map((u) => {
          const c = clientesAll.find((x) => x.id === u.clienteId);
          return c
            ? { id: c.id, nombre: c.nombre, telefono: c.telefono, principal: u.principal }
            : { id: u.clienteId, nombre: 'Cliente', telefono: null, principal: u.principal };
        });
      }
    }

    const mapSub = (estado: string, sub: string | null): string => {
      if (sub && ['en_camino_origen', 'en_origen', 'en_transito', 'en_destino', 'completado', 'agendado'].includes(sub)) {
        return sub;
      }
      if (estado === 'completado') return 'completado';
      if (estado === 'en_curso') return 'en_transito';
      return 'agendado';
    };

    const toEntrada = (tid: string) => {
      const t = tramos.find((x) => x.id === tid);
      if (!t) return null;
      let off: [number, number] | null = null;
      if (t.ventana?.inicio && t.ventana?.fin) {
        const now = new Date();
        const [hi, mi] = t.ventana.inicio.split(':').map(Number);
        const [hf, mf] = t.ventana.fin.split(':').map(Number);
        const start = new Date(now);
        start.setHours(hi, mi, 0, 0);
        const end = new Date(now);
        end.setHours(hf, mf, 0, 0);
        off = [
          Math.round((start.getTime() - now.getTime()) / 60000),
          Math.round((end.getTime() - now.getTime()) / 60000),
        ];
      }
      return {
        tid,
        off,
        sub: mapSub(t.estado, t.subestado),
        seguro: t.seguro,
      };
    };

    const turnoEntries = turno.trasladoIds.map(toEntrada).filter(Boolean);
    const poolEntries = disponibles.trasladoIds.map(toEntrada).filter(Boolean);

    return NextResponse.json({
      conductorId,
      turno: turnoEntries,
      pool: poolEntries,
      tramos: JSON.parse(JSON.stringify(tramos)),
      rutas: JSON.parse(JSON.stringify([...rutasMap.values()])),
      vehiculos: JSON.parse(JSON.stringify([...vehiculosMap.values()])),
      paradas: JSON.parse(JSON.stringify(paradas)),
      clientesPorVehiculo: JSON.parse(JSON.stringify(clientesPorVehiculo)),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'snapshot_error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
