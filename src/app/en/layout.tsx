import type { ReactNode } from "react";
import { HtmlLangPatch } from "@/components/landing/HtmlLangPatch";

export default function EnLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HtmlLangPatch lang="en" />
      {children}
    </>
  );
}
