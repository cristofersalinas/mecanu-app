import type { Metadata } from 'next';
import { PanelApp } from '@/components/taller/PanelApp';

export const metadata: Metadata = {
  title: 'Panel del taller · Mecanu',
  description: 'Panel de administración del taller: traslados, campañas, contactos, tempario y flota.',
};

export default function PanelPage() {
  return <PanelApp />;
}
