/**
 * Cliente Supabase con cookies (Server Components / Route Handlers).
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // En Server Component puro set puede fallar; el proxy refresca sesión.
        }
      },
    },
  });
}

export type PerfilSesion = {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  tallerId: string | null;
  conductorId: string | null;
  documento: string | null;
};

export async function getPerfilSesion(): Promise<PerfilSesion | null> {
  const sb = await createSupabaseServerAuth();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await sb
    .from('perfiles')
    .select('id, email, nombre, rol, taller_id, conductor_id, documento')
    .eq('id', user.id)
    .maybeSingle();

  if (!perfil) {
    const meta = user.app_metadata ?? {};
    return {
      id: user.id,
      email: user.email ?? '',
      nombre: (meta.nombre as string) || user.email || 'Usuario',
      rol: (meta.rol as string) || 'operacion',
      tallerId: (meta.taller_id as string) || null,
      conductorId: (meta.conductor_id as string) || null,
      documento: null,
    };
  }

  return {
    id: perfil.id,
    email: perfil.email,
    nombre: perfil.nombre,
    rol: perfil.rol,
    tallerId: perfil.taller_id,
    conductorId: perfil.conductor_id,
    documento: perfil.documento,
  };
}
