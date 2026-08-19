import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/ds/Logo";
import { POSTS, getAuthor, formatDate } from "@/lib/blog/data";
import { BlogPostsGrid } from "./BlogPostsGrid";
import styles from "./blog.module.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Blog — Mecanu",
  description: "Artículos sobre operaciones, logística y tecnología para talleres mecánicos.",
  alternates: {
    canonical: "https://mecanu.com/blog",
    types: {
      "application/rss+xml": "https://mecanu.com/feed.xml",
    },
  },
};

export default function BlogIndexPage() {
  const [featured, ...rest] = POSTS;
  const featuredAuthor = getAuthor(featured.authorSlug);

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo} aria-label="Mecanu — volver a la web">
          <Logo height={20} />
        </Link>
        <div className={styles.navLinks}>
          <Link href="/contacto" className={styles.navCta}>Hablar con Mecanu</Link>
        </div>
      </nav>

      {/* Hero section + post destacado */}
      <div className={styles.blogIndexHero}>
        <p className={styles.blogIndexEyebrow}>Mecanu / Ideas para el taller</p>
        <h1 className={styles.blogIndexTitle}>El blog</h1>
        <p className={styles.blogIndexSubtitle}>
          Operaciones, logística y tecnología para talleres que quieren moverse mejor.
        </p>

        <Link href={`/blog/${featured.slug}`} className={styles.featuredCard}>
          <div className={styles.featuredImage}>
            <Image
              src={featured.coverImage}
              alt={featured.coverAlt}
              fill
              style={{ objectFit: "cover", objectPosition: "center top" }}
              priority
              sizes="50vw"
            />
          </div>
          <div className={styles.featuredMeta}>
            <p className={styles.featuredCat}>{featured.category}</p>
            <h2 className={styles.featuredTitle}>{featured.title}</h2>
            <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
            <span className={styles.featuredByline}>
              por {featuredAuthor?.name} · {formatDate(featured.publishedAt)} · {featured.readingMinutes} min
            </span>
          </div>
        </Link>
      </div>

      {/* Resto de posts */}
      {rest.length > 0 ? (
        <div className={styles.postsSection}>
          <p className={styles.postsSectionLabel}>Más artículos</p>
          <BlogPostsGrid posts={rest} />
        </div>
      ) : null}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerActions}>
          <Link href="/contacto" className={styles.footerBtnBlack}>Hablar con Mecanu</Link>
          <Link href="/" className={styles.footerBtnWhite}>Volver a la web</Link>
        </div>
        <p className={styles.footerLegal}>
          © 2026 Mecanu. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
