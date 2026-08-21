import { PanelRecuperarForm } from '@/components/auth/PanelRecuperarForm';
import styles from '@/components/auth/panel-auth.module.css';

export const metadata = {
  title: 'Recuperar contraseña · Mecanu',
  robots: { index: false, follow: false },
};

export default function PanelRecuperarPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.brand}>Recuperar contraseña</h1>
        <p className={styles.sub}>Te enviamos un enlace al correo de la cuenta.</p>
        <PanelRecuperarForm />
      </div>
    </main>
  );
}
