"use client";

import { useEffect, useState } from "react";
import { ContactLoading } from "@/components/landing/ContactLoading";
import { ContactForm } from "@/components/landing/ContactForm";
import type { LandingCopy } from "@/lib/landing/copy";
import type { Locale } from "@/lib/landing/locales";
import styles from "@/app/landing.module.css";

const MIN_MS = 2000;

export function ContactPageWrapper({
  copy,
  locale,
}: {
  copy: LandingCopy["contacto"];
  locale: Locale;
}) {
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setListo(true), MIN_MS);
    return () => clearTimeout(t);
  }, []);

  if (!listo) {
    return <ContactLoading locale={locale} />;
  }

  return <ContactForm copy={copy} locale={locale} />;
}
