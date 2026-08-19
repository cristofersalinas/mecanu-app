import Link from "next/link";
import { Inter_Tight } from "next/font/google";
import { Logo } from "@/components/ds/Logo";
import { pathFor, type Locale } from "@/lib/landing/locales";
import type { LandingCopy } from "@/lib/landing/copy";
import styles from "@/app/landing.module.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--landing-font",
  display: "swap",
});

export function ErrorScreen({
  locale,
  copy,
  onRetry,
}: {
  locale: Locale;
  copy: LandingCopy["errors"]["notFound"] | LandingCopy["errors"]["server"];
  onRetry?: () => void;
}) {
  const retryLabel = "retry" in copy ? copy.retry : undefined;

  return (
    <main className={`${styles.page} ${styles.errorPage} ${interTight.variable}`}>
      <div className={styles.errorInner}>
        <Link href={pathFor(locale)} aria-label="Mecanu">
          <Logo variant="dark" height={19} />
        </Link>
        <p className={styles.errorKicker}>{copy.kicker}</p>
        <h1 className={styles.errorHeadline}>{copy.headline}</h1>
        <p className={styles.errorSubtext}>{copy.subtext}</p>
        <div className={styles.errorActions}>
          {onRetry && retryLabel ? (
            <button type="button" className={styles.btnSecondary} onClick={onRetry}>
              {retryLabel}
            </button>
          ) : null}
          <Link className={styles.btnPrimary} href={pathFor(locale)}>
            {copy.cta}
          </Link>
        </div>
      </div>
    </main>
  );
}
