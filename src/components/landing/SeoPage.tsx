import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/ds/Logo";
import styles from "./SeoPage.module.css";

export type RelatedLink = { href: string; label: string };

/**
 * Shell compartido de las páginas SEO (ciudad, comparativa, caso de uso).
 * Mantiene nav, breadcrumb, CTA y enlazado interno consistentes para que
 * añadir una página nueva sea escribir solo su contenido.
 */
export function SeoPage({
  breadcrumb,
  title,
  lede,
  children,
  ctaText = "¿Quieres probar Mecanu en tu taller?",
  ctaHref = "/contacto",
  related,
}: {
  breadcrumb: string;
  title: string;
  lede: string;
  children: ReactNode;
  ctaText?: string;
  ctaHref?: string;
  related: RelatedLink[];
}) {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" aria-label="Mecanu — volver a la web" className={styles.navLogo}>
          <Logo height={20} />
        </Link>
        <Link href="/contacto" className={styles.navCta}>
          Hablar con Mecanu
        </Link>
      </nav>

      <article className={styles.article}>
        <p className={styles.breadcrumb}>
          <Link href="/">Mecanu</Link>
          {" › "}
          {breadcrumb}
        </p>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lede}>{lede}</p>

        <div className={styles.body}>{children}</div>

        <div className={styles.cta}>
          <p className={styles.ctaText}>{ctaText}</p>
          <Link href={ctaHref} className={styles.ctaBtn}>
            Hablar con Mecanu →
          </Link>
        </div>

        <div className={styles.related}>
          <p className={styles.relatedLabel}>Seguir leyendo</p>
          <div className={styles.relatedLinks}>
            {related.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}

/** Tabla comparativa. Es el formato que Google extrae para featured snippets. */
export function CompareTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: { label: string; cells: string[] }[];
}) {
  return (
    <table className={styles.compare}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col" />
          {columns.map((col) => (
            <th scope="col" key={col}>
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            {row.cells.map((cell, i) => (
              <td key={`${row.label}-${columns[i]}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Bloque de FAQ visible. Emitir el FAQPage JSON-LD aparte en la página. */
export function FaqBlock({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <div className={styles.faqBlock}>
      {items.map((item) => (
        <details className={styles.faqItem} key={item.q}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
