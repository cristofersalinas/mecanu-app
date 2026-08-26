/**
 * Link de autoagendamiento (campaña aceptada / prospecto con oferta).
 *
 * Relojes en paralelo:
 * - 3 h laborales → mensaje automático de «¿cómo te fue con el link?»
 * - 12 h (reloj de pared) → tarea de seguimiento en el kanban (si sigue sin cita)
 */

export const HORAS_SEGUIR_AGENDA_LINK = 12;
export const HORAS_NUDGE_AGENDA_LABORALES = 3;

/** Lun–vie, 09:00–18:00 (hora local del entorno). */
export const HORARIO_LABORAL = {
  horaInicio: 9,
  horaFin: 18,
  /** getDay(): 0 domingo … 6 sábado */
  dias: [1, 2, 3, 4, 5] as readonly number[],
} as const;

/** No reenviar si el momento due quedó muy atrás (p. ej. seeds o panel cerrado). */
export const MARGEN_ATRASO_NUDGE_MS = 6 * 3600000;

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

/** Nudge automático a las 3 h laborales (sistema). */
export function mensajeNudgeAgendaAutomatico(opts: { nombre: string }): string {
  const n = opts.nombre.trim() || 'hola';
  return (
    `Hola ${n}, ¿qué tal con el enlace para elegir día y franja? ` +
    'Si te resulta más cómodo, lo vemos por aquí y te dejamos la cita lista.'
  );
}

export function esMensajeNudgeAgendaAutomatico(texto: string | null | undefined): boolean {
  if (!texto) return false;
  return texto.includes('¿qué tal con el enlace para elegir día y franja?');
}

export interface AgendaLinkCampana {
  enviadoEn: number;
  /** Ayuda manual del seguimiento 12 h; si es ≥ enviadoEn, esa tarea no vuelve. */
  ayudaEn?: number;
  /** Nudge automático 3 h laborales ya enviado en este ciclo de link. */
  autoNudgeEnviadoEn?: number;
  token: string;
}

/** ¿Hay cita comprometida / viaje en curso? (lectura de estado de ruta). */
export function hayAgendamientoConfirmado(ruta: {
  estado: string;
  fecha: Date | null;
} | null | undefined): boolean {
  if (!ruta) return false;
  if (ruta.estado === 'cancelado') return false;
  if (ruta.estado === 'agendado' || ruta.estado === 'en_ruta' || ruta.estado === 'en_taller' || ruta.estado === 'completado') {
    return true;
  }
  // Prospecto con fecha propuesta aún no es cita cerrada.
  return false;
}

export function esDiaLaboral(d: Date): boolean {
  return (HORARIO_LABORAL.dias as readonly number[]).includes(d.getDay());
}

export function esDentroHorarioLaboral(d: Date): boolean {
  if (!esDiaLaboral(d)) return false;
  const minutos = d.getHours() * 60 + d.getMinutes();
  const ini = HORARIO_LABORAL.horaInicio * 60;
  const fin = HORARIO_LABORAL.horaFin * 60;
  return minutos >= ini && minutos < fin;
}

function inicioJornada(d: Date): Date {
  const x = new Date(d);
  x.setHours(HORARIO_LABORAL.horaInicio, 0, 0, 0);
  return x;
}

function finJornada(d: Date): Date {
  const x = new Date(d);
  x.setHours(HORARIO_LABORAL.horaFin, 0, 0, 0);
  return x;
}

function siguienteInicioLaboral(desde: Date): Date {
  const x = new Date(desde);
  x.setSeconds(0, 0);
  for (let i = 0; i < 14; i++) {
    if (esDiaLaboral(x)) {
      const ini = inicioJornada(x);
      const fin = finJornada(x);
      if (x < ini) return ini;
      if (x < fin) return x;
    }
    x.setDate(x.getDate() + 1);
    x.setHours(HORARIO_LABORAL.horaInicio, 0, 0, 0);
  }
  return x;
}

/** Añade horas solo dentro de Lun–Vie 09–18. */
export function sumarHorasLaborales(desde: Date, horas: number): Date {
  if (horas <= 0) return new Date(desde);
  let restanteMs = horas * 3600000;
  let t = siguienteInicioLaboral(desde);
  while (restanteMs > 0) {
    const fin = finJornada(t);
    const hueco = fin.getTime() - t.getTime();
    if (hueco <= 0) {
      t = siguienteInicioLaboral(new Date(fin.getTime() + 1));
      continue;
    }
    if (restanteMs <= hueco) {
      return new Date(t.getTime() + restanteMs);
    }
    restanteMs -= hueco;
    t = siguienteInicioLaboral(new Date(fin.getTime() + 1));
  }
  return t;
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

/**
 * ¿Toca el mensaje automático de 3 h laborales?
 * Exige: sin agendamiento, sin nudge previo de este ciclo, due alcanzado,
 * ahora dentro de horario laboral, y due no demasiado atrasado.
 */
export function tocaNudgeAgendaLaboral(opts: {
  linkEnviadoEn: number;
  ahoraMs: number;
  autoNudgeEnviadoEn?: number | null;
  hayAgendamiento: boolean;
  margenAtrasoMs?: number;
}): boolean {
  if (opts.hayAgendamiento) return false;
  if (opts.autoNudgeEnviadoEn != null && opts.autoNudgeEnviadoEn >= opts.linkEnviadoEn) return false;
  const due = sumarHorasLaborales(new Date(opts.linkEnviadoEn), HORAS_NUDGE_AGENDA_LABORALES).getTime();
  if (opts.ahoraMs < due) return false;
  const margen = opts.margenAtrasoMs ?? MARGEN_ATRASO_NUDGE_MS;
  if (opts.ahoraMs - due > margen) return false;
  if (!esDentroHorarioLaboral(new Date(opts.ahoraMs))) return false;
  return true;
}

export function msHastaNudgeAgendaLaboral(linkEnviadoEn: number, desdeMs = Date.now()): number {
  const due = sumarHorasLaborales(new Date(linkEnviadoEn), HORAS_NUDGE_AGENDA_LABORALES).getTime();
  return Math.max(0, due - desdeMs);
}
