import { fps } from './theme';

/** Duración en frames a partir de segundos. */
export const sec = (s: number) => Math.round(s * fps);

/**
 * Orden del video. Cada bloque es una escena Continuity.
 * Total ≈ 2:15 a 30 fps.
 */
export const SCENE = {
  intro: sec(5),
  agenda: sec(10),
  panel: sec(14),
  conductor: sec(12),
  sync: sec(12),
  flujo: sec(28),
  seguro: sec(11),
  alertas: sec(22),
  itv: sec(14),
  metricas: sec(12),
  cierre: sec(7),
} as const;

export const TOTAL_FRAMES = Object.values(SCENE).reduce((a, b) => a + b, 0);

export const AGENDA_ITEMS = [
  { n: '01', label: 'Panel del taller', hint: 'Kanban, fichas, presupuesto' },
  { n: '02', label: 'App del conductor', hint: 'Jornada, chequeo, evidencia' },
  { n: '03', label: 'Sincronización', hint: 'Cómo se hablan las dos apps' },
  { n: '04', label: 'Flujo de punta a punta', hint: 'Del cliente al retiro' },
  { n: '05', label: 'Seguro en trayecto', hint: 'Si el coche choca' },
  { n: '06', label: 'Alertas + WhatsApp', hint: 'Chequeo → agente → cierre' },
  { n: '07', label: 'ITV sin fricción', hint: 'El taller se encarga del trámite' },
  { n: '08', label: 'Beneficios', hint: 'Coordinación, radio, rotación' },
] as const;
