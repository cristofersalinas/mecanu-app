import { PanelNuevaContrasenaForm } from '@/components/auth/PanelNuevaContrasenaForm';
import { AuthShell } from '@/components/auth/AuthShell';

export const metadata = {
  title: 'Nueva contraseña · Mecanu',
  robots: { index: false, follow: false },
};

export default function PanelNuevaContrasenaPage() {
  return (
    <AuthShell
      title="Nueva contraseña"
      subtitle="Elige una contraseña nueva. Después entras al panel automáticamente."
    >
      <PanelNuevaContrasenaForm />
    </AuthShell>
  );
}
