import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/ds/Logo";
import { AUTHORS, getAuthor, getPostsByAuthor, formatDate } from "@/lib/blog/data";
import styles from "../../blog.module.css";

export const dynamic = "force-static";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return AUTHORS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) return {};
  return {
    title: `${author.name} — Blog Mecanu`,
    description: author.bio,
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();

  const posts = getPostsByAuthor(author.slug);

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo} aria-label="Mecanu — volver a la web">
          <Logo height={20} />
        </Link>
        <div className={styles.navLinks}>
          <Link href="/blog" className={styles.navLink}>Blog</Link>
          <Link href="/contacto" className={styles.navCta}>Hablar con Mecanu</Link>
        </div>
      </nav>

      {/* Perfil centrado */}
      <div className={styles.authorPage}>
        <p className={styles.authorPageLabel}>Autor</p>
        {author.avatar ? (
          <div className={styles.authorPageAvatar}>
            <Image
              src={author.avatar}
              alt={author.name}
              width={120}
              height={120}
              style={{ objectFit: "cover", objectPosition: "center top" }}
            />
          </div>
        ) : (
          <div className={styles.authorPageAvatarPlaceholder} aria-hidden="true">👤</div>
        )}
        <h1 className={styles.authorPageName}>{author.name}</h1>
        <p className={styles.authorPageBio}>{author.bio}</p>

        {/* Posts del autor */}
        <div className={styles.authorPagePosts}>
          <p className={styles.authorPagePostsLabel}>Artículos</p>
          <div className={styles.relatedGrid}>
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.relatedCard}>
                <div className={styles.relatedThumb}>
                  <Image
                    src={p.coverImage}
                    alt={p.coverAlt}
                    width={560}
                    height={315}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <span className={styles.relatedCat}>{p.category}</span>
                <p className={styles.relatedTitle}>{p.title}</p>
                <span className={styles.relatedByline}>{formatDate(p.publishedAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

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
