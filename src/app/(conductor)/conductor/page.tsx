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
export default function ConductorPage() {
  return <ConductorApp />;
}
