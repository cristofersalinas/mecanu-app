/**
 * G05: el conductor sugiere un compañero (flota interna o red Mecanu).
 * G01: invitar colaborador del taller. Sin envío real.
 */

export type TipoReferido = 'interna' | 'externa';

export interface ReferidoInput {
  nombre: string;
  telefono: string;
  tipo: TipoReferido;
  quienRecomiendaId: string;
}

export function validarReferido(input: ReferidoInput): string | null {
  if (input.nombre.trim().length < 2) return 'Pon el nombre de tu amigo';
  const tel = input.telefono.replace(/\s/g, '');
  if (!/^\+?\d{8,15}$/.test(tel)) return 'El teléfono no parece un número';
  if (!input.quienRecomiendaId) return 'Falta quién recomienda';
  return null;
}

export function validarEmailInvitacion(email: string): string | null {
  const v = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return 'El email no es válido';
  return null;
}

export function copyDondeInvitarDespues(): string {
  return 'Si ahora no se te ocurre nadie, más adelante está en Disponibles → Invitar a un compañero.';
}
