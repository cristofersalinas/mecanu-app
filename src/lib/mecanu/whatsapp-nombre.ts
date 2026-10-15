/**
 * Nombres de chat WhatsApp en la bandeja: sin emoji y con ~ si solo vienen de WA.
 */

/** Quita iconos/emoji del nombre que WhatsApp suele meter en el push name. */
export function limpiarNombreWhatsApp(nombre: string): string {
  return nombre
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\uFE0F/g, '')
    .replace(/[\u200D\u200B\u2060]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Nombre usable (no vacío, no solo el número). */
export function nombreWaUtil(nombre: string | null | undefined, telefono: string): boolean {
  const n = limpiarNombreWhatsApp(nombre ?? '');
  if (!n) return false;
  const nd = n.replace(/\D/g, '');
  const td = telefono.replace(/\D/g, '');
  if (nd && td && (nd === td || nd.endsWith(td.slice(-9)) || td.endsWith(nd.slice(-9)))) {
    return false;
  }
  if (/^\+?\d[\d\s.\-()]{6,}$/.test(n)) return false;
  if (/^\d{8,}$/.test(nd) && !/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(n)) return false;
  return true;
}

/**
 * Etiqueta de lista:
 * - Si hay ficha en Mecanu → nombre de ficha (sin ~).
 * - Si solo hay nombre de WhatsApp → `~ Nombre` (como en WA: no es contacto guardado).
 * - Si no hay nombre útil → teléfono.
 */
export function etiquetaNombreBandeja(opts: {
  nombreFicha: string | null | undefined;
  nombreWa: string | null | undefined;
  telefono: string;
}): string {
  const ficha = limpiarNombreWhatsApp(opts.nombreFicha ?? '');
  if (ficha && nombreWaUtil(ficha, opts.telefono)) return ficha;

  const wa = limpiarNombreWhatsApp(opts.nombreWa ?? '');
  if (nombreWaUtil(wa, opts.telefono)) {
    const sinTilde = wa.replace(/^~\s*/, '');
    return `~ ${sinTilde}`;
  }
  const tel = opts.telefono.trim() || wa;
  return tel || 'Sin nombre';
}
