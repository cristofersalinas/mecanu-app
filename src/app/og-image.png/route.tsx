import { OG_BY_SLUG, renderOgImage } from "@/lib/landing/og";

export const runtime = "edge";

export async function GET() {
  return renderOgImage(OG_BY_SLUG.home!);
}
