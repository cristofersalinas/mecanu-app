import type { GeoPasiva } from "./events";

/** Solo cabeceras que Vercel ya adjunta. Nada de geolocalización en el navegador. */
export function geoDeRequest(headers: Headers): GeoPasiva {
  return {
    pais: headers.get("x-vercel-ip-country"),
    region: headers.get("x-vercel-ip-country-region"),
    ciudad: headers.get("x-vercel-ip-city"),
  };
}

export function userAgentDeRequest(headers: Headers): string | null {
  return headers.get("user-agent");
}
