import { PanelLoginForm } from '@/components/auth/PanelLoginForm';
import styles from '@/components/auth/panel-auth.module.css';

export const metadata = {
  title: 'Entrar al panel · Mecanu',
  robots: { index: false, follow: false },
};

export default function PanelEntrarPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.brand}>Mecanu</h1>
        <p className={styles.sub}>Panel del taller. Email, teléfono o Google.</p>
        <PanelLoginForm />
      </div>
    </main>
  );
}
