import type { ReactNode } from "react";
import { HtmlLangPatch } from "@/components/landing/HtmlLangPatch";

export default function CaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HtmlLangPatch lang="ca" />
      {children}
    </>
  );
}
