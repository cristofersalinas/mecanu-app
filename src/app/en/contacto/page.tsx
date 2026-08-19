import type { Metadata } from "next";
import type { Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import { ContactPageWrapper } from "@/components/landing/ContactPageWrapper";
import { copyFor } from "@/lib/landing/copy";
import styles from "@/app/landing.module.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--landing-font",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Talk to Mecanu",
  description: "Tell us about your shop and we will get back to you within 24 hours.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function ContactoPageEn() {
  const copy = copyFor("en");
  return (
    <main className={`${styles.page} ${interTight.variable}`}>
      <ContactPageWrapper copy={copy.contacto} locale="en" />
    </main>
  );
}
