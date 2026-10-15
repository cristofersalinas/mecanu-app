import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/ds/Logo";
import { AUTHORS, getAuthor, getPostsByAuthor, formatDate } from "@/lib/blog/data";
import styles from "../../blog.module.css";

export const dynamic = "force-static";

type Props = { params: Promise<{ slug: string }> };

/** Slugs de autor persona ya retirados: no indexar ni servir como destino. */
const RETIRED_PERSON_AUTHORS = new Set(["cristofer"]);

export async function generateStaticParams() {
  return [
    ...AUTHORS.map((a) => ({ slug: a.slug })),
    ...[...RETIRED_PERSON_AUTHORS].map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (RETIRED_PERSON_AUTHORS.has(slug)) {
    return {
      title: "Blog — Mecanu",
      robots: { index: false, follow: false },
      alternates: { canonical: "https://mecanu.com/blog" },
    };
  }
  const author = getAuthor(slug);
  if (!author) return { robots: { index: false, follow: false } };
  // Página de marca, no de persona: no competir con el índice del blog.
  return {
    title: `Blog — Mecanu`,
    description: author.bio,
    robots: { index: false, follow: true },
    alternates: { canonical: "https://mecanu.com/blog" },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;

  if (RETIRED_PERSON_AUTHORS.has(slug)) {
    redirect("/blog");
  }

  const author = getAuthor(slug);
  if (!author) notFound();

  const posts = getPostsByAuthor(author.slug);

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo} aria-label="Mecanu — volver a la web">
          <Logo height={20} />
        </Link>
        <div className={styles.navLinks}>
          <Link href="/blog" className={styles.navLink}>Blog</Link>
          <Link href="/contacto" className={styles.navCta}>Hablar con Mecanu</Link>
        </div>
      </nav>

      <div className={styles.authorPage}>
        <p className={styles.authorPageLabel}>Blog</p>
        <h1 className={styles.authorPageName}>{author.name}</h1>
        <p className={styles.authorPageBio}>{author.bio}</p>
      </div>

      {posts.length > 0 && (
        <div className={styles.postsSection}>
          <p className={styles.postsSectionLabel}>Artículos</p>
          <div className={styles.postsGrid}>
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.postCard}>
                <div className={styles.postThumb}>
                  <Image
                    src={p.coverImage}
                    alt={p.coverAlt}
                    width={560}
                    height={315}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <span className={styles.postCat}>{p.category}</span>
                <p className={styles.postTitle}>{p.title}</p>
                <span className={styles.postByline}>{formatDate(p.publishedAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

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
