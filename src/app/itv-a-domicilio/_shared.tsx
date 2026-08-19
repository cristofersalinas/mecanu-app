import type { ReactNode } from "react";
import type { Metadata } from "next";
import { SeoPage, FaqBlock } from "@/components/landing/SeoPage";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/landing/JsonLd";
import { ItvLeadForm } from "@/components/landing/ItvLeadForm";
import type { FaqItem } from "@/lib/landing/faq";

export const dynamic = "force-static";

type Props = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  lede: string;
  keywords: string[];
  children: ReactNode;
  faq: readonly FaqItem[];
};

export function itvSubMetadata(slug: string, title: string, description: string, keywords: string[]): Metadata {
  const url = `https://mecanu.com/itv-a-domicilio/${slug}`;
  return {
    title,
    description,
    keywords: keywords.join(", "),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Mecanu",
      images: [{ url: "https://mecanu.com/og-image.png", width: 1200, height: 630 }],
    },
  };
}

export function ItvSubPage({ slug, title, h1, lede, children, faq }: Omit<Props, "description" | "keywords"> & { title: string }) {
  const url = `https://mecanu.com/itv-a-domicilio/${slug}`;
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "ITV a domicilio", path: "/itv-a-domicilio" },
          { name: title, path: `/itv-a-domicilio/${slug}` },
        ]}
      />
      <FaqJsonLd items={faq} pageUrl={url} />
      <SeoPage
        breadcrumb={title}
        title={h1}
        lede={lede}
        ctaText="Pide la recogida. Te abrimos WhatsApp con tus datos."
        ctaHref="/itv-a-domicilio#pedir-itv"
        related={[
          { href: "/itv-a-domicilio", label: "Pedir ITV a domicilio" },
          { href: "/itv-a-domicilio/madrid", label: "Madrid" },
          { href: "/itv-a-domicilio/barcelona", label: "Barcelona" },
          { href: "/blog", label: "Guías de ITV" },
        ]}
      >
        {children}
        <h2>Pedir ahora</h2>
        <ItvLeadForm compact />
        <h2>Preguntas</h2>
        <FaqBlock items={faq} />
      </SeoPage>
    </>
  );
}
