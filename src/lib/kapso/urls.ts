/**
 * URLs de Kapso que el panel puede embeber. Cualquier otra host se rechaza
 * antes de meterla en un iframe.
 */

export const KAPSO_INBOX_HOST = "inbox.kapso.ai";
export const KAPSO_SETUP_HOSTS = ["app.kapso.ai", "setup.kapso.ai"] as const;

export function esInboxEmbedUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return (
      u.protocol === "https:" &&
      u.hostname === KAPSO_INBOX_HOST &&
      u.pathname.startsWith("/embed/") &&
      u.pathname.length > "/embed/".length
    );
  } catch {
    return false;
  }
}

export function esSetupUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return (
      u.protocol === "https:" &&
      (KAPSO_SETUP_HOSTS as readonly string[]).includes(u.hostname) &&
      u.pathname.includes("/whatsapp/setup/")
    );
  } catch {
    return false;
  }
}

function origenPermitido(hostname: string, protocol: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") return protocol === "http:" || protocol === "https:";
  if (protocol !== "https:") return false;
  if (hostname === "mecanu.com" || hostname === "www.mecanu.com") return true;
  return hostname.endsWith(".vercel.app");
}

export function origenPublicoDesdeRequest(originHeader: string | null, nextOrigin: string): string {
  const candidatos = [originHeader, nextOrigin];
  for (const c of candidatos) {
    if (!c) continue;
    try {
      const u = new URL(c);
      if (origenPermitido(u.hostname, u.protocol)) return u.origin;
    } catch {
      /* siguiente */
    }
  }
  return "http://localhost:3000";
}

export function redirectsWhatsApp(origen: string): { ok: string; error: string } {
  return {
    ok: `${origen}/panel?whatsapp=ok`,
    error: `${origen}/panel?whatsapp=error`,
  };
}
