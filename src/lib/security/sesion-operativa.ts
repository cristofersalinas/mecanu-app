import { NextResponse } from "next/server";
import { createSupabaseServerAuth, getPerfilSesion } from "@/lib/supabase/auth-server";
import { supabaseServerConfigured } from "@/lib/supabase/server";
import { debeExigirSesion } from "./controles";

const SIN_CACHE = { "Cache-Control": "no-store" } as const;

function jsonEstado(status: 401 | 403, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status, headers: SIN_CACHE });
}

/** Misma regla que el panel: Supabase real y sin demo. */
export function sesionOperativaObligatoria(): boolean {
  const demo =
    process.env.MECANU_DEMO === "1" || process.env.NEXT_PUBLIC_MECANU_DEMO === "1";
  return debeExigirSesion({
    supabaseConfigurado: supabaseServerConfigured(),
    demo,
  });
}

/**
 * Cualquier usuario con sesión. En demo o sin Supabase no hace nada,
 * para que el panel y el conductor locales sigan abiertos.
 */
export async function exigirSesionSiAplica(): Promise<NextResponse | null> {
  if (!sesionOperativaObligatoria()) return null;
  const sb = await createSupabaseServerAuth();
  const { data: { user } } = sb ? await sb.auth.getUser() : { data: { user: null } };
  if (!user) {
    return jsonEstado(401, "unauthorized", "Sesión requerida.");
  }
  return null;
}

export type GateConductor =
  | { ok: true; conductorId: string }
  | { ok: false; respuesta: NextResponse };

/**
 * Si el perfil tiene `conductor_id`, la petición tiene que nombrar a ese
 * conductor. Sin vínculo, una sesión válida sigue pudiendo indicar el id
 * (la app aún no inicia sesión como conductor): queda anotado como riesgo
 * residual en docs/HARDENING-SOC2-ISO27001.md.
 */
export async function exigirConductorSiAplica(pedido: string): Promise<GateConductor> {
  if (!sesionOperativaObligatoria()) return { ok: true, conductorId: pedido };
  const perfil = await getPerfilSesion();
  if (!perfil) return { ok: false, respuesta: jsonEstado(401, "unauthorized", "Sesión requerida.") };
  if (perfil.conductorId && perfil.conductorId !== pedido) {
    return {
      ok: false,
      respuesta: jsonEstado(403, "forbidden", "No puedes actuar por otro conductor."),
    };
  }
  return { ok: true, conductorId: pedido };
}
