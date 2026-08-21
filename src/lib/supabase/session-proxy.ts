/**
 * Refresco de sesión Supabase en el proxy (cookies).
 * Ver https://supabase.com/docs/guides/auth/server-side/nextjs
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function actualizarSesionSupabase(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return { response, user: null as null };
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request: { headers: request.headers } });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  return { response, user };
}

export const PANEL_AUTH_PUBLICAS = [
  '/panel/entrar',
  '/panel/registro',
  '/panel/recuperar',
  '/panel/nueva-contrasena',
] as const;

export function esRutaAuthPanel(pathname: string): boolean {
  return PANEL_AUTH_PUBLICAS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function esPanelApp(pathname: string): boolean {
  if (pathname !== '/panel' && !pathname.startsWith('/panel/')) return false;
  return !esRutaAuthPanel(pathname);
}

/** Destinos permitidos tras /auth/callback */
export function nextAuthPermitido(nextRaw: string | null): string {
  const next = nextRaw && nextRaw.startsWith('/') ? nextRaw : '/panel';
  if (next === '/conductor' || next.startsWith('/conductor/')) return next;
  if (next === '/panel' || next.startsWith('/panel/')) return next;
  return '/panel';
}
