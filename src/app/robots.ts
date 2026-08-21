import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mecanu.com";

/**
 * `robots.txt` es permisivo por defecto: lo que no se prohíbe, se rastrea. Por eso
 * aquí solo se listan los bloqueos — así una página pública nueva es rastreable
 * sin tener que acordarse de añadirla a una allowlist.
 *
 * Los rastreadores de IA tienen su propio grupo porque, en robots.txt, el grupo
 * más específico gana: si solo existiera el de `*`, algunos bots de IA lo
 * respetarían pero otros buscan su propio user-agent y su ausencia se interpreta
 * de forma inconsistente. Se les aplican los mismos bloqueos privados.
 */
const PRIVADO = [
  "/panel",
  "/panel/",
  "/conductor",
  "/conductor/",
  "/backoffice",
  "/backoffice/",
  "/api/",
  "/_next/",
  "/assistant",
  "/internal/",
];

const RASTREADORES_IA = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "claude-user",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot",
  "Applebot-Extended",
  "Bingbot",
  "meta-externalagent",
  "cohere-ai",
  "YouBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVADO },
      ...RASTREADORES_IA.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: PRIVADO,
      })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
