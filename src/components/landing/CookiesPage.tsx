import Link from "next/link";
import { Logo } from "@/components/ds/Logo";
import { copyFor } from "@/lib/landing/copy";
import { pathFor, type Locale } from "@/lib/landing/locales";
import styles from "@/app/landing.module.css";

/**
 * Página de política de cookies. La estructura, la ruta y el enlace desde el
 * banner están listos; el cuerpo legal lo aporta el fundador y hasta entonces
 * se ve un aviso explícito de que falta, no un texto de relleno que parezca
 * jurídicamente válido.
 */
export function CookiesPage({ locale }: { locale: Locale }) {
  const copy = copyFor(locale).cookiesPage;

  return (
    <main className={styles.legalPage}>
      <div className={styles.legalInner}>
        <Link href={pathFor(locale)} aria-label="Mecanu">
          <Logo variant="dark" height={19} />
        </Link>

        <h1 className={styles.legalTitulo}>{copy.titulo}</h1>
        <p className={styles.legalIntro}>{copy.intro}</p>

        <p className={styles.legalPlaceholder} role="note">
          {copy.placeholder}
        </p>

        <Link className={styles.legalVolver} href={pathFor(locale)}>
          {copy.volver}
        </Link>
      </div>
    </main>
  );
}
