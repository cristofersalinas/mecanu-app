/**
 * Link de autoagendamiento desde campaña aceptada (tarea crear ruta).
 * Tras enviarlo, si en 12 h no hay ruta, nace un seguimiento de ayuda.
 */

export const HORAS_SEGUIR_AGENDA_LINK = 12;

export const DETALLE_SEGUIR_AGENDA = 'Link sin agendar';

export function idDeberSeguirAgenda(campanaId: string): string {
  return `seguir-agenda-${campanaId}`;
}

export function esDeberSeguirAgenda(id: string): boolean {
  return id.startsWith('seguir-agenda-');
}

/** Tareas de campaña aceptada que abren el chat de agenda. */
export function esDeberAgendaCampana(d: { id: string; tipo: string }): boolean {
  return d.tipo === 'crear_ruta' || esDeberSeguirAgenda(d.id);
}

export function tokenAgendaCampana(campanaId: string): string {
  return `ag-${campanaId.toLowerCase().replace(/[^a-z0-9-]/g, '')}`;
}

export function urlAgendaAutogestion(token: string, origin = 'https://mecanu.com'): string {
  return `${origin.replace(/\/$/, '')}/a/${encodeURIComponent(token)}`;
}

export function mensajeLinkAgenda(opts: { nombre: string; url: string }): string {
  const n = opts.nombre.trim() || 'hola';
  return (
    `Hola ${n}, aquí tienes el enlace para elegir día y franja tú mismo:\n` +
    `${opts.url}\n\n` +
    'Si te resulta más fácil, también lo podemos agendar por este chat.'
  );
}

export function mensajeSeguirAgendaAyuda(): string {
  return '¿Necesitas ayuda para agendar o prefieres que lo veamos juntos por este chat?';
}

export interface AgendaLinkCampana {
  enviadoEn: number;
  /** Ayuda enviada en este ciclo de link; si es ≥ enviadoEn, el seguimiento 12 h no vuelve. */
  ayudaEn?: number;
  token: string;
}

/** ¿Toca el seguimiento tras el link (12 h sin ruta y sin ayuda de este ciclo)? */
export function tocaSeguirAgendaLink(
  link: AgendaLinkCampana | null | undefined,
  ahoraMs: number,
): boolean {
  if (!link) return false;
  if (ahoraMs - link.enviadoEn < HORAS_SEGUIR_AGENDA_LINK * 3600000) return false;
  if (link.ayudaEn != null && link.ayudaEn >= link.enviadoEn) return false;
  return true;
}
