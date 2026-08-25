import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { PanelApp } from '@/components/taller/PanelApp';
import { leerEstadoUrl, searchDesdeParams } from '@/lib/mecanu/panel-url-estado';
import { createSupabaseServerAuth } from '@/lib/supabase/auth-server';
import { ensurePerfilPanel } from '@/lib/supabase/ensure-panel-perfil';
import { supabaseServerConfigured } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Panel del taller · Mecanu',
  description: 'Panel de administración del taller: traslados, campañas, contactos, tempario y flota.',
};

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const demoSinAuth = process.env.MECANU_DEMO === '1' || process.env.NEXT_PUBLIC_MECANU_DEMO === '1';
  if (supabaseServerConfigured() && !demoSinAuth) {
    const sb = await createSupabaseServerAuth();
    const { data: { user } } = sb ? await sb.auth.getUser() : { data: { user: null } };
    if (!user) redirect('/panel/entrar');
    try {
      await ensurePerfilPanel(user);
    } catch {
      // Perfil opcional si falla el upsert; la sesión basta para abrir.
    }
  }

  const h = await headers();
  const sp = await searchParams;
  const inicial = leerEstadoUrl({
    pathname: h.get('x-mecanu-pathname') ?? '/panel',
    search: searchDesdeParams(sp),
    host: h.get('x-forwarded-host') ?? h.get('host') ?? '',
  });

  return <PanelApp inicial={inicial} />;
}
