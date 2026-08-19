"use client";

import { useEffect } from "react";

/**
 * Actualiza document.documentElement.lang en el cliente cuando la ruta
 * tiene un locale distinto al del servidor (que sirve "es" por defecto).
 * Es necesario porque el Root Layout ya no llama a headers() — lo que
 * permite que todas las rutas sean estáticas/cacheables.
 */
export function HtmlLangPatch({ lang }: { lang: string }) {
  useEffect(() => {
    if (document.documentElement.lang !== lang) {
      document.documentElement.lang = lang;
    }
  }, [lang]);
  return null;
}
