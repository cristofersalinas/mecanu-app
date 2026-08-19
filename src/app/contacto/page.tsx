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
  title: "Hablar con Mecanu",
  description: "Cuéntanos sobre tu taller y te contactamos en menos de 24 horas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function ContactoPage() {
  const copy = copyFor("es");
  return (
    <main className={`${styles.page} ${interTight.variable}`}>
      <ContactPageWrapper copy={copy.contacto} locale="es" />
    </main>
  );
}
