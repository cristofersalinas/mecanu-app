import { PanelLoginForm } from '@/components/auth/PanelLoginForm';
import { AuthShell } from '@/components/auth/AuthShell';

export const metadata = {
  title: 'Entrar al panel · Mecanu',
  robots: { index: false, follow: false },
};

export default function PanelEntrarPage() {
  return (
    <AuthShell
      title="Entra al panel"
      subtitle="Email y contraseña, teléfono o Google. Solo para el equipo del taller."
    >
      <PanelLoginForm />
    </AuthShell>
  );
}
