import { PanelRegistroForm } from '@/components/auth/PanelRegistroForm';
import styles from '@/components/auth/panel-auth.module.css';

export const metadata = {
  title: 'Crear cuenta · Panel · Mecanu',
  robots: { index: false, follow: false },
};

export default function PanelRegistroPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.brand}>Crear cuenta</h1>
        <p className={styles.sub}>Para el panel del taller. Confirmaremos tu email.</p>
        <PanelRegistroForm />
      </div>
    </main>
  );
}
