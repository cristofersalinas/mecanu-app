export const FPS = 30;
export const ANCHO = 1920;
export const ALTO = 1080;

export const GUION = [
  {
    id: "traslados",
    titulo: "Traslados",
    seg: 13,
    pie: "Tablero · Traslados. Cada card es una ruta. Solo Prospectos se arrastra: soltar en Agendado abre la ventana de una hora; soltar en Cancelado pide motivo. En ruta no se mueve desde aquí.",
  },
  {
    id: "tareas",
    titulo: "Tareas",
    seg: 11,
    pie: "Tablero · Tareas. Es lo que el taller puede cerrar. Solo Pendiente se arrastra. Cancelar pide motivo y no anula la ruta.",
  },
  {
    id: "campanas",
    titulo: "Campañas",
    seg: 13,
    pie: "Tablero · Campañas. El presupuesto vive aquí y desde Traslados solo se lee. 284,50 € de reparación + 90,00 € de traslado = 374,50 €, IVA incluido. Cada paso es un botón.",
  },
  {
    id: "cruce",
    titulo: "Misma ruta",
    seg: 12,
    pie: "Cuando el taller asigna la ventana y el conductor, el móvil recibe el mismo TR-1042: matrícula, ventana de una hora y cobertura.",
  },
  {
    id: "jornada",
    titulo: "Jornada",
    seg: 11,
    pie: "La jornada del conductor: uno en ruta, luego los de hoy con ventana, y al final lo que sigue pendiente de agendar. Arriba, Disponibles y SOS.",
  },
  {
    id: "enruta",
    titulo: "En ruta",
    seg: 16,
    pie: "En ruta lo sube el conductor, con el botón de abajo. El tablero enseña el mismo subestado y no lo empuja.",
  },
  {
    id: "checkin",
    titulo: "Check-in",
    seg: 12,
    pie: "En origen no hay marcha sin check-in: 4 fotos, vídeo, km y combustible, y después la inspección. Un testigo rojo bloquea la salida y avisa al taller.",
  },
  {
    id: "pide",
    titulo: "Solicitud",
    seg: 10,
    pie: "Si algo no cuadra, el conductor deja una solicitud. No cambia el estado. El taller la resuelve en la ficha de la ruta.",
  },
  {
    id: "red",
    titulo: "Sin red",
    seg: 9,
    pie: "Sin ubicación la app no deja seguir. Sin red, el cambio queda en la cola. Al volver se reintenta esa misma cola, no se empieza de cero.",
  },
  {
    id: "vuelta",
    titulo: "En taller",
    seg: 11,
    pie: "Con el coche en el taller: agendar la vuelta, ofrecerla, o confirmar que el cliente ya lo retiró. La vuelta entra en el móvil como otro traslado, con su ventana.",
  },
] as const;

export type EscenaId = (typeof GUION)[number]["id"];

export const DURACION = GUION.reduce((total, escena) => total + escena.seg * FPS, 0);

export function framesDe(id: EscenaId): number {
  const escena = GUION.find((item) => item.id === id);
  return (escena?.seg ?? 0) * FPS;
}
