import { OG_BY_SLUG, renderOgImage } from "@/lib/landing/og";

export const runtime = "edge";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;
  const payload = OG_BY_SLUG[slug];
  if (!payload) {
    return new Response("Not found", { status: 404 });
  }
  return renderOgImage(payload);
}
