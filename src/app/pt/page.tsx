import type { Viewport } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { landingMetadata } from "@/lib/landing/metadata";

export const metadata = landingMetadata("pt");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function PortugueseHome({
  searchParams,
}: {
  searchParams: Promise<{ hero?: string }>;
}) {
  const { hero } = await searchParams;
  return <LandingPage locale="pt" heroForce={hero} />;
}
