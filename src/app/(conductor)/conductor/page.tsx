import type { Metadata } from 'next';
import { ConductorApp } from '@/components/conductor/ConductorApp';

export const metadata: Metadata = {
  title: 'Mecanu · Conductor',
  description: 'App del conductor: jornada, traslados, check-in y emergencias.',
};

/**
 * Única ruta de la app del conductor. Dentro no hay routing: la navegación
 * entre pantallas es estado de React, como en una app nativa.
 */
export default async function ConductorPage({
  searchParams,
}: {
  searchParams: Promise<{ conductorId?: string; traslado?: string }>;
}) {
  const sp = await searchParams;
  const conductorId = typeof sp.conductorId === 'string' ? sp.conductorId : undefined;
  const trasladoId = typeof sp.traslado === 'string' ? sp.traslado : undefined;
  return <ConductorApp conductorId={conductorId} trasladoId={trasladoId} />;
}
