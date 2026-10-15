import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/ds/Logo";
import { POSTS, getPost, getAuthor, formatDate } from "@/lib/blog/data";
import { BlogPostJsonLd } from "@/components/landing/JsonLd";
import { Applause } from "../Applause";
import { ShareLinks } from "../ShareLinks";
import styles from "../blog.module.css";

export const dynamic = "force-static";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mecanu.com";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const author = getAuthor(post.authorSlug);
  const url = `${SITE}/blog/${slug}`;
  const image = post.coverImage.startsWith("http") ? post.coverImage : `${SITE}${post.coverImage}`;
  const authorName = author?.name ?? "Mecanu";

  return {
    title: `${post.title} — Blog Mecanu`,
    description: post.excerpt,
    authors: [{ name: authorName }],
    keywords: [
      "taller mecánico", "Mecanu", post.category,
      "recogida coches", "logística vehículos", "mecánico a domicilio",
      "alternativa grúa taller", "taller Madrid", "taller Barcelona",
    ].join(", "),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${post.title} — Blog Mecanu`,
      description: post.excerpt,
      siteName: "Mecanu",
      publishedTime: post.publishedAt,
      authors: [authorName],
      images: [{ url: image, width: 1200, height: 630, alt: post.coverAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — Blog Mecanu`,
      description: post.excerpt,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const author = getAuthor(post.authorSlug);
  const authorName = author?.name ?? "Mecanu";
  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className={styles.page}>
      <BlogPostJsonLd
        title={post.title}
        description={post.excerpt}
        slug={post.slug}
        publishedAt={post.publishedAt}
        authorName={authorName}
        image={post.coverImage}
      />
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo} aria-label="Mecanu — volver a la web">
          <Logo height={20} />
        </Link>
        <div className={styles.navLinks}>
          <Link href="/blog" className={styles.navLink}>Blog</Link>
          <Link href="/contacto" className={styles.navCta}>Hablar con Mecanu</Link>
        </div>
      </nav>

      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <span>›</span>
        <Link href="/blog">Blog</Link>
        <span>›</span>
        <span>{post.category}</span>
      </div>

      <div className={styles.hero}>
        <div className={styles.heroImage}>
          <Image
            src={post.coverImage}
            alt={post.coverAlt}
            fill
            style={{ objectFit: "cover", objectPosition: "center top" }}
            priority
            sizes="100vw"
          />
        </div>
        <div className={styles.heroMeta}>
          <p className={styles.category}>{post.category}</p>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.byline}>
            <span>{authorName}</span>
            <span className={styles.bylineDot}>·</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span className={styles.bylineDot}>·</span>
            <span>{post.readingMinutes} min de lectura</span>
          </div>
        </div>
      </div>

      <div className={styles.articleWrap}>
        <article>
          <ShareLinks title={post.title} />
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <Applause slug={post.slug} />
        </article>
      </div>

      <div className={styles.ctaBanner}>
        <h2>¿Tu taller todavía mueve coches a mano?</h2>
        <p>Mecanu coordina recogidas, entregas y conductores —tuyos o de Mecanu— en un solo panel. Sin hojas de cálculo.</p>
        <Link href="/contacto" className={styles.ctaBannerBtn}>
          Hablar con Mecanu
        </Link>
      </div>

      <div className={styles.authorSection}>
        <div className={styles.authorInfo}>
          <span className={styles.authorLabel}>Publicado por</span>
          <span className={styles.authorName}>{authorName}</span>
          {author?.bio ? <span className={styles.authorBio}>{author.bio}</span> : null}
        </div>
        <Link href="/blog" className={styles.authorProfileLink}>
          Ver el blog →
        </Link>
      </div>

      {related.length > 0 ? (
        <div className={styles.related}>
          <div className={styles.relatedLabel}>
            <span>Lo último del blog</span>
            <Link href="/blog" className={styles.relatedMore}>Ver más →</Link>
          </div>
          <div className={styles.relatedGrid}>
            {related.map((p) => (
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
                <div className={styles.relatedCardBody}>
                  <span className={styles.relatedCat}>{p.category}</span>
                  <p className={styles.relatedTitle}>{p.title}</p>
                  <span className={styles.relatedByline}>
                    {formatDate(p.publishedAt)}
                  </span>
                  <span className={styles.relatedReadLink}>Leer →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

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
