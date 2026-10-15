import { KAPSO_THEME_MECANU } from "./theme";
import { clasificarNumeroKapso, type NumeroKapsoVista } from "./numeros";
import { esSetupUrl } from "./urls";

const KAPSO_API = "https://api.kapso.ai/platform/v1";

function apiKey(): string | null {
  const k = process.env.KAPSO_API_KEY?.trim();
  return k || null;
}

async function kapso<T>(path: string, init?: RequestInit): Promise<T | null> {
  const key = apiKey();
  if (!key) return null;
  const res = await fetch(`${KAPSO_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-Key": key,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export function inboxEmbedUrlDesdeEnv(): string | null {
  const u = process.env.KAPSO_INBOX_EMBED_URL?.trim() ?? "";
  return u || null;
}

export function setupUrlDesdeEnv(): string | null {
  const u = process.env.KAPSO_SETUP_LINK_URL?.trim() ?? "";
  return u || null;
}

export function customerIdDesdeEnv(): string {
  return process.env.KAPSO_CUSTOMER_ID?.trim() || "f4d509a7-657f-4416-a802-675725698100";
}

export async function listarNumerosKapso(): Promise<NumeroKapsoVista[]> {
  const body = await kapso<{ data?: unknown[] }>("/whatsapp/phone_numbers");
  if (!body?.data) return [];
  return body.data
    .map((row) => clasificarNumeroKapso(row as Record<string, unknown>))
    .filter((n): n is NumeroKapsoVista => n !== null);
}

export async function asegurarSetupLink(opts: {
  successRedirectUrl: string;
  failureRedirectUrl: string;
}): Promise<string | null> {
  const existente = setupUrlDesdeEnv();
  if (existente && esSetupUrl(existente)) return existente;

  const customerId = customerIdDesdeEnv();
  const listed = await kapso<{
    data?: Array<{ status?: string; url?: string }>;
  }>(`/customers/${customerId}/setup_links`);
  const activo = listed?.data?.find((l) => l.status === "active" && l.url && esSetupUrl(l.url));
  if (activo?.url) return activo.url;

  const created = await kapso<{ data?: { url?: string } }>(`/customers/${customerId}/setup_links`, {
    method: "POST",
    body: JSON.stringify({
      setup_link: {
        allowed_connection_types: ["coexistence"],
        language: "es",
        provision_phone_number: false,
        phone_number_country_isos: ["ES"],
        success_redirect_url: opts.successRedirectUrl,
        failure_redirect_url: opts.failureRedirectUrl,
        theme_config: KAPSO_THEME_MECANU,
      },
    }),
  });
  const url = created?.data?.url;
  return url && esSetupUrl(url) ? url : null;
}
