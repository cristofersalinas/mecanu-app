import { PanelRegistroForm } from '@/components/auth/PanelRegistroForm';
import { AuthShell } from '@/components/auth/AuthShell';

export const metadata = {
  title: 'Crear cuenta · Panel · Mecanu',
  robots: { index: false, follow: false },
};

export default function PanelRegistroPage() {
  return (
    <AuthShell>
      <PanelRegistroForm />
    </AuthShell>
  );
}
