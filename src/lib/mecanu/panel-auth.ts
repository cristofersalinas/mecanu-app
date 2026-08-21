import { NextResponse } from 'next/server';
import { createSupabaseServerAuth } from '@/lib/supabase/auth-server';
import { ensurePerfilPanel } from '@/lib/supabase/ensure-panel-perfil';
import { supabaseServerConfigured } from '@/lib/supabase/server';

/** Exige sesión de panel cuando Supabase está configurado y no estamos en demo. */
export async function requirePanelSession(): Promise<NextResponse | null> {
  if (!supabaseServerConfigured() || process.env.MECANU_DEMO === '1') return null;
  const sb = await createSupabaseServerAuth();
  const { data: { user } } = sb ? await sb.auth.getUser() : { data: { user: null } };
  if (!user) {
    return NextResponse.json({ error: { code: 'unauthorized', message: 'Sesión requerida.' } }, { status: 401 });
  }
  try {
    await ensurePerfilPanel(user);
  } catch {
    /* best-effort */
  }
  return null;
}
