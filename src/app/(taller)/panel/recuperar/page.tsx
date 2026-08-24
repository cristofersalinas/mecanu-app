import { PanelRecuperarForm } from '@/components/auth/PanelRecuperarForm';
import { AuthShell } from '@/components/auth/AuthShell';

export const metadata = {
  title: 'Recuperar contraseña · Mecanu',
  robots: { index: false, follow: false },
};

export default function PanelRecuperarPage() {
  return (
    <AuthShell>
      <PanelRecuperarForm />
    </AuthShell>
  );
}
