import type { MetadataRoute } from "next";
import { LOCALES, pathFor, contactoPathFor } from "@/lib/landing/locales";
import { POSTS, AUTHORS } from "@/lib/blog/data";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mecanu.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Páginas de la landing por locale
  const landingPages = LOCALES.map((locale) => ({
    url: `${SITE}${pathFor(locale)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 1.0 : 0.9,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${SITE}${pathFor(l)}`])
      ),
    },
  }));

  // Páginas de contacto por locale
  const contactoPages = LOCALES.map((locale) => ({
    url: `${SITE}${contactoPathFor(locale)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Índice del blog
  const blogIndex = {
    url: `${SITE}/blog`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  };

  // Posts individuales
  const blogPosts = POSTS.map((post) => ({
    url: `${SITE}/blog/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  // Perfiles de autor
  const authorPages = AUTHORS.map((author) => ({
    url: `${SITE}/blog/author/${author.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Money pages: ciudad, caso de uso, comparativas y entidad
  const moneyPages = [
    { url: `${SITE}/madrid`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${SITE}/barcelona`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${SITE}/para-talleres`, priority: 0.85, changeFrequency: "monthly" as const },
    { url: `${SITE}/que-es-mecanu`, priority: 0.85, changeFrequency: "monthly" as const },
    { url: `${SITE}/capacidad-taller`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${SITE}/alternativa-grua`, priority: 0.8, changeFrequency: "monthly" as const },
    {
      url: `${SITE}/alternativa-mecanico-a-domicilio`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${SITE}/taller-oficial-o-multimarca`,
      priority: 0.75,
      changeFrequency: "monthly" as const,
    },
    { url: `${SITE}/itv-para-talleres`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${SITE}/software-taller`, priority: 0.75, changeFrequency: "monthly" as const },
    { url: `${SITE}/mantenimiento-marcas`, priority: 0.75, changeFrequency: "monthly" as const },
    { url: `${SITE}/cliente-no-recoge-coche`, priority: 0.8, changeFrequency: "monthly" as const },
  ].map((p) => ({ ...p, lastModified: now }));

  // Política de privacidad
  const staticPages = [
    {
      url: `${SITE}/privacidad`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  return [
    ...landingPages,
    ...moneyPages,
    ...contactoPages,
    blogIndex,
    ...blogPosts,
    ...authorPages,
    ...staticPages,
  ];
}
