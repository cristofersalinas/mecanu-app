import type { Viewport } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { landingMetadata } from "@/lib/landing/metadata";

export const metadata = landingMetadata("pt");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function PortugueseHome() {
  return <LandingPage locale="pt" />;
}
