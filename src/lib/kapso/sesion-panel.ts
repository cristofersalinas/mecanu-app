import { NextResponse } from "next/server";
import { createSupabaseServerAuth } from "@/lib/supabase/auth-server";
import { supabaseServerConfigured } from "@/lib/supabase/server";

/** Misma regla que el snapshot del panel: con Supabase y sin demo, hace falta sesión. */
export async function exigirSesionPanelSiAplica(): Promise<NextResponse | null> {
  if (!supabaseServerConfigured() || process.env.MECANU_DEMO === "1") return null;
  const sb = await createSupabaseServerAuth();
  const { data: { user } } = sb ? await sb.auth.getUser() : { data: { user: null } };
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
