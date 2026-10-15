export const FPS = 30;
export const ANCHO = 1920;
export const ALTO = 1080;

export type Ambito = "panel" | "conductor" | "las dos";

export const GUION = [
  { id: "portada", titulo: "Cómo funciona", ambito: "las dos", seg: 5 },
  { id: "dos", titulo: "Dos pantallas, un trabajo", ambito: "las dos", seg: 10 },
  { id: "modulos", titulo: "Qué hay en el panel", ambito: "panel", seg: 12 },
  { id: "tareas", titulo: "Tareas", ambito: "panel", seg: 11 },
  { id: "traslados", titulo: "Traslados", ambito: "panel", seg: 13 },
  { id: "campanas", titulo: "Campañas", ambito: "panel", seg: 13 },
  { id: "cruce", titulo: "El taller agenda, el conductor lo recibe", ambito: "las dos", seg: 12 },
  { id: "jornada", titulo: "La jornada del conductor", ambito: "conductor", seg: 11 },
  { id: "avance", titulo: "En ruta", ambito: "las dos", seg: 16 },
  { id: "evidencia", titulo: "Check-in y entrega", ambito: "las dos", seg: 13 },
  { id: "pide", titulo: "El conductor pide, el taller decide", ambito: "las dos", seg: 11 },
  { id: "offline", titulo: "GPS y sin red", ambito: "las dos", seg: 9 },
  { id: "vuelta", titulo: "En taller, y la vuelta", ambito: "las dos", seg: 11 },
  { id: "cierre", titulo: "En una frase", ambito: "las dos", seg: 8 },
] as const;

export type EscenaId = (typeof GUION)[number]["id"];

export const DURACION = GUION.reduce((total, escena) => total + escena.seg * FPS, 0);

export function framesDe(id: EscenaId): number {
  const escena = GUION.find((item) => item.id === id);
  return (escena?.seg ?? 0) * FPS;
}
