"use client";

import { useEffect } from "react";
import { trackConversion } from "@/lib/landing/analytics";

const HITOS_SCROLL = [25, 50, 75, 100] as const;

/**
 * Eventos que no cuelgan de un botón concreto: profundidad de scroll, clics
 * salientes y clics en WhatsApp.
 *
 * Delegado en `document` en vez de repartir `onClick` por la página: la landing
 * es casi toda anclas, y así un enlace nuevo queda medido sin que nadie tenga
 * que acordarse de instrumentarlo.
 *
 * Empuja a `dataLayer` siempre. Si el usuario no aceptó analítica, GTM no está
 * cargado y esos eventos se quedan en un array en memoria que nunca sale del
 * navegador.
 */
export function PageAnalytics() {
  useEffect(() => {
    const alcanzados = new Set<number>();

    function alHacerScroll() {
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      if (alto <= 0) return;

      const porcentaje = (window.scrollY / alto) * 100;
      for (const hito of HITOS_SCROLL) {
        if (porcentaje >= hito && !alcanzados.has(hito)) {
          alcanzados.add(hito);
          trackConversion("profundidad_scroll", { porcentaje: hito });
        }
      }
    }

    function alHacerClic(evento: MouseEvent) {
      const enlace = (evento.target as HTMLElement | null)?.closest("a");
      if (!(enlace instanceof HTMLAnchorElement)) return;

      const href = enlace.getAttribute("href") ?? "";
      if (!href || href.startsWith("#")) return;

      if (/^(https?:)?\/\/(wa\.me|api\.whatsapp\.com)/i.test(href) || href.startsWith("whatsapp:")) {
        trackConversion("clic_whatsapp", { destino: href });
        return;
      }

      // Saliente = otro host. `new URL` con base resuelve rutas relativas sin
      // que haya que distinguirlas a mano.
      try {
        const destino = new URL(href, window.location.href);
        if (destino.host !== window.location.host) {
          trackConversion("clic_saliente", { destino: destino.href, host: destino.host });
        }
      } catch {
        // href que no es una URL (mailto:, tel:). No es saliente medible.
      }
    }

    function alEnviarFormulario(evento: Event) {
      const formulario = evento.target;
      if (!(formulario instanceof HTMLFormElement)) return;
      trackConversion("envio_formulario", {
        formulario_id: formulario.id || formulario.name || "sin_identificar",
      });
    }

    alHacerScroll();
    window.addEventListener("scroll", alHacerScroll, { passive: true });
    document.addEventListener("click", alHacerClic);
    document.addEventListener("submit", alEnviarFormulario);

    return () => {
      window.removeEventListener("scroll", alHacerScroll);
      document.removeEventListener("click", alHacerClic);
      document.removeEventListener("submit", alEnviarFormulario);
    };
  }, []);

  return null;
}
