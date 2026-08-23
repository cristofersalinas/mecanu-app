import type { Viewport } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { landingMetadata } from "@/lib/landing/metadata";

export const metadata = landingMetadata("es");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ hero?: string }>;
}) {
  const { hero } = await searchParams;
  return <LandingPage locale="es" heroForce={hero} />;
}
