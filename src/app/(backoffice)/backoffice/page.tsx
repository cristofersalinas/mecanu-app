import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { repo } from '@/lib/mecanu/repo';
import { BackofficeApp } from '@/components/backoffice/BackofficeApp';
import { sesionOperativaObligatoria } from '@/lib/security/sesion-operativa';
import { createSupabaseServerAuth } from '@/lib/supabase/auth-server';
import { ACTOR_BACKOFFICE } from './session';

export const metadata: Metadata = {
  title: 'Backoffice · Mecanu',
  description: 'Cockpit del dueño: alertas, bandeja del conductor, cobertura, dinero y equipo.',
};

export const dynamic = 'force-dynamic';

export default async function BackofficePage() {
  if (sesionOperativaObligatoria()) {
    const sb = await createSupabaseServerAuth();
    const { data: { user } } = sb ? await sb.auth.getUser() : { data: { user: null } };
    if (!user) redirect('/panel/entrar');
  }
  const snapshot = await repo.getBackofficeSnapshot(ACTOR_BACKOFFICE);
  return <BackofficeApp snapshot={snapshot} />;
}
