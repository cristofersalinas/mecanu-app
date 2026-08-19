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
  title: "Falar com Mecanu",
  description: "Conta-nos sobre a tua oficina e entramos em contacto em menos de 24 horas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function ContactoPagePt() {
  const copy = copyFor("pt");
  return (
    <main className={`${styles.page} ${interTight.variable}`}>
      <ContactPageWrapper copy={copy.contacto} locale="pt" />
    </main>
  );
}
