import { PanelLoginForm } from '@/components/auth/PanelLoginForm';
import { AuthShell } from '@/components/auth/AuthShell';

export const metadata = {
  title: 'Entrar al panel · Mecanu',
  robots: { index: false, follow: false },
};

export default function PanelEntrarPage() {
  return (
    <AuthShell>
      <PanelLoginForm />
    </AuthShell>
  );
}
