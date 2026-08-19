import { POSTS } from "@/lib/blog/data";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mecanu.com";

export const dynamic = "force-static";
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET() {
  const items = [...POSTS]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .map((post) => {
      const url = `${SITE}/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog Mecanu</title>
    <link>${SITE}/blog</link>
    <description>Operaciones de taller: recogida de coches, plazas, conductores y seguro de traslados.</description>
    <language>es-es</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
