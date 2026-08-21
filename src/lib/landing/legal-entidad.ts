/**
 * Identidad societaria y contactos legales de Mecanu.
 *
 * Valores por defecto = Automotive Technologies SpA (Chile). Se pueden
 * sobrescribir con NEXT_PUBLIC_LEGAL_* en Vercel sin tocar código.
 *
 * Ver docs/CUMPLIMIENTO-UE.md.
 */

export type LegalEntidad = {
  nombreComercial: string;
  web: string;
  emailContacto: string;
  emailPrivacidad: string;
  razonSocial: string | null;
  /** RUT chileno u otro identificador fiscal (NIF, VAT…). */
  nif: string | null;
  /** Etiqueta del identificador en las páginas legales ("RUT", "NIF"…). */
  idFiscalLabel: string;
  domicilio: string | null;
  pais: string;
  formaJuridica: string | null;
  autoridadControl: { nombre: string; url: string };
  autoridadControlLocal: { nombre: string; url: string } | null;
  ultimaRevision: string;
};

/** Datos públicos del titular. No son secretos. */
export const LEGAL_DEFAULTS = {
  razonSocial: "Automotive Technologies SpA",
  rut: "77.620.433-1",
  domicilio: "Las Bellotas 199, of. 91, Providencia, Santiago, Chile",
  pais: "Chile",
  formaJuridica: "Sociedad por Acciones (SpA)",
} as const;

function leerOpcional(clave: string): string | null {
  const v = process.env[clave]?.trim();
  return v && v.length > 0 ? v : null;
}

export function legalEntidad(): LegalEntidad {
  return {
    nombreComercial: "Mecanu",
    web: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mecanu.com",
    emailContacto: "cris@mecanu.com",
    emailPrivacidad: "privacidad@mecanu.com",
    razonSocial: leerOpcional("NEXT_PUBLIC_LEGAL_RAZON_SOCIAL") ?? LEGAL_DEFAULTS.razonSocial,
    nif: leerOpcional("NEXT_PUBLIC_LEGAL_NIF") ?? LEGAL_DEFAULTS.rut,
    idFiscalLabel: leerOpcional("NEXT_PUBLIC_LEGAL_ID_LABEL") ?? "RUT",
    domicilio: leerOpcional("NEXT_PUBLIC_LEGAL_DOMICILIO") ?? LEGAL_DEFAULTS.domicilio,
    pais: leerOpcional("NEXT_PUBLIC_LEGAL_PAIS") ?? LEGAL_DEFAULTS.pais,
    formaJuridica: leerOpcional("NEXT_PUBLIC_LEGAL_FORMA") ?? LEGAL_DEFAULTS.formaJuridica,
    // Visitantes/clientes en España/UE → AEPD como autoridad de reclamación habitual.
    autoridadControl: {
      nombre: "Agencia Española de Protección de Datos (AEPD)",
      url: "https://www.aepd.es",
    },
    // Titular chileno → autoridad local (Ley 21.719 / Agencia de Protección de Datos Personales).
    autoridadControlLocal: {
      nombre: "Agencia de Protección de Datos Personales (Chile)",
      url: "https://www.pd.gob.cl",
    },
    ultimaRevision: "2026-08-20",
  };
}

/** true solo si están los tres datos societarios mínimos de la LSSI-CE. */
export function entidadIdentificada(e: LegalEntidad = legalEntidad()): boolean {
  return Boolean(e.razonSocial && e.nif && e.domicilio);
}

export const ENCARGADOS_TRATAMIENTO = [
  {
    nombre: "Vercel Inc.",
    finalidad: "Hosting, edge, Analytics y Speed Insights (solo con consentimiento)",
    sede: "EE. UU. / UE (según región del despliegue)",
    transferencias: "Cláusulas contractuales tipo (SCC) de la Comisión Europea",
  },
  {
    nombre: "Google LLC (Tag Manager, Analytics 4, Sheets)",
    finalidad: "Analítica web (consentimiento) y almacenamiento de leads de formularios",
    sede: "EE. UU.",
    transferencias: "SCC + configuración de retención en GA4",
  },
  {
    nombre: "Microsoft Corporation (Clarity)",
    finalidad: "Mapas de calor y grabaciones de sesión (consentimiento)",
    sede: "EE. UU.",
    transferencias: "SCC",
  },
  {
    nombre: "Resend",
    finalidad: "Envío de notificaciones de formularios a Mecanu",
    sede: "EE. UU.",
    transferencias: "SCC",
  },
  {
    nombre: "Slack Technologies, LLC",
    finalidad: "Aviso inmediato de leads de /contacto e ITV en el canal interno #leads",
    sede: "EE. UU.",
    transferencias: "SCC",
  },
  {
    nombre: "Meta Platforms (WhatsApp)",
    finalidad: "Canal de conversación cuando el usuario abre WhatsApp con mensaje prellenado",
    sede: "EE. UU. / Irlanda",
    transferencias: "Condiciones de WhatsApp Business / SCC según Meta",
  },
  {
    nombre: "Functional Software, Inc. (Sentry)",
    finalidad: "Errores técnicos (si hay DSN configurado); sin PII de formularios",
    sede: "EE. UU.",
    transferencias: "SCC",
  },
] as const;

export const PLAZOS_RETENCION = {
  consentimientoCookies: "12 meses (luego se vuelve a preguntar)",
  preferenciaIdioma: "12 meses",
  leadsContacto: "24 meses desde el último contacto comercial, o hasta baja",
  leadsItv: "24 meses desde el último contacto, o hasta baja",
  registrosSeguridad: "90 días",
  logsHosting: "según política del proveedor (Vercel)",
} as const;
