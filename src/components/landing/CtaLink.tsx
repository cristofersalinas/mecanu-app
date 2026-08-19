"use client";

import type { ReactNode } from "react";
import { trackConversion } from "@/lib/landing/analytics";

/**
 * Ancla del CTA principal que además deja el evento de conversión.
 *
 * Existe como componente aparte porque `LandingPage` es un Server Component:
 * un `onClick` no puede vivir ahí. Solo se usa en los CTA que cuentan como
 * conversión, no en la navegación normal — la profundidad de scroll y los
 * clics salientes ya los recoge `PageAnalytics` por delegación.
 */
export function CtaLink({
  href,
  origen,
  className,
  children,
}: {
  href: string;
  origen: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => trackConversion("cta_principal", { cta_origen: origen })}
    >
      {children}
    </a>
  );
}
