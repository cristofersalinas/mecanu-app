import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mecanu.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/blog/", "/contacto", "/ca/", "/en/", "/pt/", "/privacidad"],
        disallow: ["/conductor", "/conductor/", "/panel", "/panel/", "/api/", "/_next/"],
      },
      // Permitir explícitamente a los rastreadores de IA
      { userAgent: "GPTBot", allow: ["/", "/blog", "/blog/"] },
      { userAgent: "ChatGPT-User", allow: ["/", "/blog", "/blog/"] },
      { userAgent: "Google-Extended", allow: ["/", "/blog", "/blog/"] },
      { userAgent: "ClaudeBot", allow: ["/", "/blog", "/blog/"] },
      { userAgent: "anthropic-ai", allow: ["/", "/blog", "/blog/"] },
      { userAgent: "PerplexityBot", allow: ["/", "/blog", "/blog/"] },
      { userAgent: "Applebot", allow: ["/", "/blog", "/blog/"] },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
