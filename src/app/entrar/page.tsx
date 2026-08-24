import { EntrarForm } from '@/components/auth/EntrarForm';
import styles from '@/components/auth/entrar.module.css';

export const metadata = {
  title: 'Entrar · Conductor · Mecanu',
  robots: { index: false, follow: false },
};

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const error = sp.error ? decodeURIComponent(sp.error) : undefined;

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.brand}>Mecanu</h1>
        <p className={styles.sub}>
          App del conductor. El enlace de acceso solo se envía por correo.
        </p>
        {error ? <p className={styles.err}>{error}</p> : null}
        <EntrarForm />
      </div>
    </main>
  );
}
