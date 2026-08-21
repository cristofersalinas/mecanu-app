import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { nextAuthPermitido } from '@/lib/supabase/session-proxy';
import { ensurePerfilPanel } from '@/lib/supabase/ensure-panel-perfil';
import { supabaseServerConfigured } from '@/lib/supabase/server';

/**
 * PKCE / OAuth / confirmación email / recovery → sesión + redirect.
 * next permitido: /conductor… o /panel…
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = nextAuthPermitido(url.searchParams.get('next'));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anon) {
    return NextResponse.redirect(new URL('/panel/entrar?error=config', url.origin));
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, anon, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const fallback = next.startsWith('/conductor') ? '/entrar' : '/panel/entrar';
      return NextResponse.redirect(
        new URL(`${fallback}?error=${encodeURIComponent(error.message)}`, url.origin),
      );
    }

    if (next.startsWith('/panel') && supabaseServerConfigured()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await ensurePerfilPanel(user);
        } catch {
          // No bloquear el login si el perfil falla; el panel reintentará.
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
