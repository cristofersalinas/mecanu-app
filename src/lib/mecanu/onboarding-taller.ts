/**
 * Onboarding del panel del taller: dos encuestas (pedir ayuda / aconsejar tutorial)
 * y lecciones siempre disponibles. Si dice que no las dos veces, no se vuelve a preguntar.
 */

export const ONBOARDING_STORAGE_KEY = 'mecanu.taller.onboarding.v1';

export const LECCIONES_TALLER = [
  { id: 'agendar', titulo: 'Agendar un traslado', para: 'Poner fecha y conductor a un coche que espera.', minutos: 3 },
  { id: 'oferta', titulo: 'Valorar una oferta', para: 'Revisar lo detectado en el check-in y enviarlo al cliente.', minutos: 3 },
  { id: 'asignar', titulo: 'Asignar un conductor', para: 'Cubrir un hueco sin pisar otra ventana de 1 h.', minutos: 2 },
  { id: 'ficha', titulo: 'Leer la ficha del viaje', para: 'Ver cliente, seguro, presupuesto y el siguiente paso.', minutos: 2 },
] as const;

export type IdLeccionTaller = (typeof LECCIONES_TALLER)[number]['id'];

export interface OnboardingTaller {
  /** 0 = aún no salió la primera; 1 = ya salió la de preguntar; 2 = ya salió la de aconsejar */
  encuestasHechas: 0 | 1 | 2;
  /** Dijo que no en las dos: no volver a preguntar. */
  silencio: boolean;
  leccionesHechas: IdLeccionTaller[];
}

export const ONBOARDING_TALLER_INICIAL: OnboardingTaller = {
  encuestasHechas: 0,
  silencio: false,
  leccionesHechas: [],
};

export type TipoEncuestaTaller = 'preguntar' | 'aconsejar';

export function encuestaPendiente(o: OnboardingTaller): TipoEncuestaTaller | null {
  if (o.silencio) return null;
  if (o.encuestasHechas === 0) return 'preguntar';
  if (o.encuestasHechas === 1) return 'aconsejar';
  return null;
}

/** `si` abre tutorial. `no` avanza la encuesta; dos no → silencio. */
export function responderEncuesta(o: OnboardingTaller, quiereTutorial: boolean): OnboardingTaller {
  if (o.silencio) return o;
  if (quiereTutorial) {
    return { ...o, encuestasHechas: 2, silencio: true };
  }
  const hechas = (o.encuestasHechas === 0 ? 1 : 2) as 1 | 2;
  return { ...o, encuestasHechas: hechas, silencio: hechas === 2 };
}

export function marcarLeccion(o: OnboardingTaller, id: IdLeccionTaller): OnboardingTaller {
  if (o.leccionesHechas.includes(id)) return o;
  return { ...o, leccionesHechas: [...o.leccionesHechas, id] };
}

export function progresoLecciones(o: OnboardingTaller): { hechas: number; total: number } {
  return { hechas: o.leccionesHechas.length, total: LECCIONES_TALLER.length };
}

export const COPY_ENCUESTA = {
  preguntar: {
    titulo: '¿Es tu primera vez en el panel?',
    texto: 'En 5 minutos puedes practicar las 4 acciones que usas cada día. El tutorial se queda en Configuración → Aprender.',
    si: 'Sí, enséñame',
    no: 'Ahora no',
  },
  aconsejar: {
    titulo: 'Te conviene el tutorial corto',
    texto: 'Agendar, valorar una oferta, asignar conductor y leer la ficha. Puedes saltártelo: siempre estará en Configuración → Aprender.',
    si: 'Abrir tutorial',
    no: 'No me lo preguntes más',
  },
} as const;

export const PASOS_LECCION: Record<IdLeccionTaller, { titulo: string; texto: string; hotspot: string }[]> = {
  agendar: [
    { titulo: 'Prospectos', texto: 'Ahí están los coches sin fecha. No se arrastran a Agendado: se agenda con confirmación.', hotspot: 'columna' },
    { titulo: 'Agendar', texto: 'El botón abre matrícula y cliente, no un código interno. Eliges día y una franja de 1 hora.', hotspot: 'boton' },
    { titulo: 'Solape', texto: 'Si ese conductor ya tiene otro viaje a esa hora (margen 1 h), no se deja confirmar.', hotspot: 'aviso' },
  ],
  oferta: [
    { titulo: 'Lo detectado', texto: 'La oferta nace del check-in (fotos, ITV, desgaste). El dinero incluye IVA.', hotspot: 'lineas' },
    { titulo: 'Valorar', texto: 'Un botón por paso: valorar → enviar al cliente. Cada uno deja rastro.', hotspot: 'boton' },
    { titulo: 'Aceptada', texto: 'Cuando el cliente acepta, creas el traslado y se abre esa ficha.', hotspot: 'ficha' },
  ],
  asignar: [
    { titulo: 'Hueco', texto: 'Un viaje agendado sin conductor es un hueco. Lo cubre la flota del taller o la red Mecanu.', hotspot: 'hueco' },
    { titulo: 'Asignar', texto: 'Elige conductor. Si se pisan ventanas, se bloquea. Invitar a alguien nuevo es otro flujo (onboarding).', hotspot: 'boton' },
  ],
  ficha: [
    { titulo: 'Qué hay', texto: 'Cliente, matrícula, seguro, ventana y presupuesto (un solo dinero, con traslado).', hotspot: 'resumen' },
    { titulo: 'Siguiente paso', texto: 'Agendar, cancelar u abrir la oferta. Las pestañas que aún no existen no se pueden pulsar.', hotspot: 'acciones' },
  ],
};
