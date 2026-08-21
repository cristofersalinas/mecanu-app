import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ds/Logo";
import { legalEntidad } from "@/lib/landing/legal-entidad";
import styles from "@/app/landing.module.css";

export function LegalDoc({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  const e = legalEntidad();
  return (
    <main className={styles.page} style={{ padding: "3rem 1.5rem" }}>
      <article
        className={styles.legalDoc}
        style={{ maxWidth: "42rem", margin: "0 auto", display: "grid", gap: "1rem" }}
      >
        <Link href="/" aria-label="Mecanu">
          <Logo variant="dark" height={19} />
        </Link>
        <h1 style={{ fontSize: "1.8rem", lineHeight: 1.15, margin: 0 }}>{titulo}</h1>
        <p style={{ margin: 0, color: "var(--faint, #6b7280)", fontSize: "0.85rem" }}>
          Última revisión: {e.ultimaRevision} · {e.nombreComercial}
        </p>
        <nav aria-label="Documentos legales" className={styles.legalNav}>
          <Link href="/aviso-legal">Aviso legal</Link>
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/terminos">Términos</Link>
          <Link href="/accesibilidad">Accesibilidad</Link>
        </nav>
        <div className={styles.legalBody}>{children}</div>
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/" style={{ textDecoration: "underline" }}>
            Volver a la portada
          </Link>
        </p>
      </article>
    </main>
  );
}

export function LegalH2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontSize: "1.1rem", marginTop: "0.75rem" }}>{children}</h2>;
}
