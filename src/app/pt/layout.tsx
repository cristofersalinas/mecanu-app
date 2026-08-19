import type { ReactNode } from "react";
import { HtmlLangPatch } from "@/components/landing/HtmlLangPatch";

export default function PtLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HtmlLangPatch lang="pt" />
      {children}
    </>
  );
}
