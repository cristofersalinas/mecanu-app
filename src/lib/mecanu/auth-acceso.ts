/**
 * Validación de acceso al panel: email, teléfono ES y contraseña al crear cuenta.
 * El magic link del conductor no se pide desde la web: llega por correo.
 */

export const PASSWORD_MIN = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LETRA_RE = /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/;

export function normalizarEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function emailValido(raw: string): boolean {
  const v = normalizarEmail(raw);
  return v.length <= 254 && EMAIL_RE.test(v);
}

export function errorEmail(raw: string): string | null {
  const v = raw.trim();
  if (!v) return 'Pon el email del taller.';
  if (!emailValido(v)) return 'Formato: tu@taller.es';
  return null;
}

/** Dígitos nacionales ES (sin prefijo 34). */
export function digitosTelefonoES(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('0034')) d = d.slice(4);
  else if (d.startsWith('34') && d.length > 9) d = d.slice(2);
  return d.slice(0, 9);
}

/** Agrupa de 3 en 3 para leer: 600 000 000. */
export function formatearTelefonoES(raw: string): string {
  const d = digitosTelefonoES(raw);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

export function telefonoE164(raw: string): string | null {
  const d = digitosTelefonoES(raw);
  if (d.length !== 9) return null;
  if (!/^[6-9]/.test(d)) return null;
  return `+34${d}`;
}

export function errorTelefono(raw: string, { obligatorio = true } = {}): string | null {
  const d = digitosTelefonoES(raw);
  if (!d) return obligatorio ? 'Pon un teléfono de 9 dígitos.' : null;
  if (d.length !== 9) return `Faltan ${9 - d.length} dígito${9 - d.length === 1 ? '' : 's'}.`;
  if (!/^[6-9]/.test(d)) return 'En España el número empieza por 6, 7, 8 o 9.';
  return null;
}

export function formatearOtp(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6);
}

export function errorOtp(raw: string): string | null {
  const d = formatearOtp(raw);
  if (d.length !== 6) return 'El código SMS son 6 dígitos.';
  return null;
}

export interface ReglaPassword {
  id: 'len' | 'letra' | 'num' | 'match';
  label: string;
  ok: boolean;
}

export function reglasPassword(password: string, repetir?: string): ReglaPassword[] {
  const reglas: ReglaPassword[] = [
    { id: 'len', label: `Al menos ${PASSWORD_MIN} caracteres`, ok: password.length >= PASSWORD_MIN },
    { id: 'letra', label: 'Al menos una letra', ok: LETRA_RE.test(password) },
    { id: 'num', label: 'Al menos un número', ok: /\d/.test(password) },
  ];
  if (repetir !== undefined) {
    reglas.push({
      id: 'match',
      label: 'Las dos coinciden',
      ok: password.length > 0 && password === repetir,
    });
  }
  return reglas;
}

export function passwordLista(password: string, repetir?: string): boolean {
  return reglasPassword(password, repetir).every((r) => r.ok);
}

export function errorPasswordNueva(password: string, repetir?: string): string | null {
  if (!passwordLista(password, repetir)) {
    const falta = reglasPassword(password, repetir).find((r) => !r.ok);
    return falta?.label ?? 'La contraseña no cumple las reglas.';
  }
  return null;
}
