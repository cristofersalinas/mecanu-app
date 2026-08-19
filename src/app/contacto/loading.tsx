import { Inter_Tight } from "next/font/google";
import { ContactLoading } from "@/components/landing/ContactLoading";
import styles from "@/app/landing.module.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--landing-font",
  display: "swap",
});

export default function Loading() {
  return (
    <main className={`${styles.page} ${interTight.variable}`}>
      <ContactLoading locale="es" />
    </main>
  );
}
