/** Credenciales Kapso (server-only). Ver `.env.example`. */

export interface KapsoConfig {
  apiKey: string;
  phoneNumberId: string;
  webhookSecret: string | null;
  wabaDisplay: string;
  wabaNombre: string;
}

export function kapsoConfigurado(env: NodeJS.ProcessEnv = process.env): boolean {
  return !!(env.KAPSO_API_KEY?.trim() && env.KAPSO_PHONE_NUMBER_ID?.trim());
}

export function leerKapsoConfig(env: NodeJS.ProcessEnv = process.env): KapsoConfig | null {
  const apiKey = env.KAPSO_API_KEY?.trim();
  const phoneNumberId = env.KAPSO_PHONE_NUMBER_ID?.trim();
  if (!apiKey || !phoneNumberId) return null;
  return {
    apiKey,
    phoneNumberId,
    webhookSecret: env.KAPSO_WEBHOOK_SECRET?.trim() || null,
    wabaDisplay: env.KAPSO_WABA_DISPLAY?.trim() || '+34 —',
    wabaNombre: env.KAPSO_WABA_NOMBRE?.trim() || 'Mecanu',
  };
}

export function requireKapsoConfig(env: NodeJS.ProcessEnv = process.env): KapsoConfig {
  const cfg = leerKapsoConfig(env);
  if (!cfg) {
    throw new Error(
      'WhatsApp no configurado: faltan KAPSO_API_KEY y/o KAPSO_PHONE_NUMBER_ID en el servidor.',
    );
  }
  return cfg;
}
