/**
 * Tokens inertes. El formato es genérico a propósito: una clave de proveedor
 * famoso en un sitio obvio delata el señuelo.
 *
 * Si alguna de estas cadenas aparece en cabecera, query o body, alguien está
 * hurgando. No abren nada.
 */

export const CANARIES = {
  AI_ASSISTANT_KEY: "mk_live_canary_a7f3e91c",
  AI_ASSISTANT_ENDPOINT: "https://mecanu.com/assistant",
  BILLING_ACCOUNT: "ba_4c2e8f01",
} as const;

const VALORES = new Set<string>(Object.values(CANARIES));

export function detectarCanary(texto: string): string | null {
  for (const valor of VALORES) {
    if (texto.includes(valor)) return valor.slice(0, 8) + "…";
  }
  return null;
}
