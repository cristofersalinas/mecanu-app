import type { Metadata } from 'next';
import { repo } from '@/lib/mecanu/repo';
import { BackofficeApp } from '@/components/backoffice/BackofficeApp';
import { ACTOR_BACKOFFICE } from './session';

export const metadata: Metadata = {
  title: 'Backoffice · Mecanu',
  description: 'Cockpit del dueño: alertas, bandeja del conductor, cobertura, dinero y equipo.',
};

export const dynamic = 'force-dynamic';

export default async function BackofficePage() {
  const snapshot = await repo.getBackofficeSnapshot(ACTOR_BACKOFFICE);
  return <BackofficeApp snapshot={snapshot} />;
}
