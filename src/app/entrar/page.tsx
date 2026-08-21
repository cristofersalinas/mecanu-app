import { EntrarForm } from '@/components/auth/EntrarForm';
import styles from '@/components/auth/entrar.module.css';

export const metadata = {
  title: 'Entrar · Conductor · Mecanu',
  robots: { index: false, follow: false },
};

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith('/conductor') ? sp.next : undefined;
  const error = sp.error ? decodeURIComponent(sp.error) : undefined;

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.brand}>Mecanu</h1>
        <p className={styles.sub}>
          App del conductor. Te mandamos un enlace al correo: sin contraseña.
        </p>
        {error ? <p className={styles.err}>{error}</p> : null}
        <EntrarForm nextPath={next} />
      </div>
    </main>
  );
}
