"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/blog/data";
import { getAuthor, formatDate } from "@/lib/blog/data";
import styles from "./blog.module.css";

const ROW_BATCH = 9;

export function BlogPostsGrid({ posts }: { posts: Post[] }) {
  const [visibleCount, setVisibleCount] = useState(ROW_BATCH);
  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  return (
    <>
      <div className={styles.postsGrid}>
        {visiblePosts.map((p) => {
          const auth = getAuthor(p.authorSlug);
          return (
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
              <div className={styles.postCardBody}>
                <span className={styles.postCat}>{p.category}</span>
                <p className={styles.postTitle}>{p.title}</p>
                <span className={styles.postByline}>
                  por {auth?.name} · {formatDate(p.publishedAt)}
                </span>
                <span className={styles.postReadLink}>Leer →</span>
              </div>
            </Link>
          );
        })}
      </div>
      {hasMore ? (
        <div className={styles.postsMoreWrap}>
          <button
            type="button"
            className={styles.postsMoreBtn}
            onClick={() => setVisibleCount((count) => count + ROW_BATCH)}
          >
            Ver 3 filas más
          </button>
        </div>
      ) : null}
    </>
  );
}
