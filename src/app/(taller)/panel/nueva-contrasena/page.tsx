import { PanelNuevaContrasenaForm } from '@/components/auth/PanelNuevaContrasenaForm';
import styles from '@/components/auth/panel-auth.module.css';

export const metadata = {
  title: 'Nueva contraseña · Mecanu',
  robots: { index: false, follow: false },
};

export default function PanelNuevaContrasenaPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.brand}>Nueva contraseña</h1>
        <p className={styles.sub}>Elige una contraseña nueva para tu cuenta del panel.</p>
        <PanelNuevaContrasenaForm />
      </div>
    </main>
  );
}
