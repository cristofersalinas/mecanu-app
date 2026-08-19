/**
 * Fuente única del FAQ público.
 *
 * Google exige que el contenido del `FAQPage` en JSON-LD sea el mismo que el
 * visible en la página. Por eso vive aquí y lo consumen tanto `LandingPage`
 * (render visible) como `JsonLd` (datos estructurados) — si se duplicara,
 * cualquier edición dejaría uno de los dos desincronizado y Google lo trataría
 * como incumplimiento de sus políticas de datos estructurados.
 */

export type FaqItem = { q: string; a: string };

export const FAQ_LANDING: readonly FaqItem[] = [
  {
    q: "¿En qué se diferencia Mecanu de una grúa?",
    a: "Una grúa mueve coches que no arrancan y cobra por urgencia. Mecanu mueve coches que funcionan, con un conductor al volante, en una ventana horaria acordada y a una fracción del coste. Si el coche no arranca sigues necesitando una grúa.",
  },
  {
    q: "¿Es lo mismo que un mecánico a domicilio?",
    a: "No. El mecánico a domicilio repara en la calle o en el garaje del cliente, con las limitaciones que eso tiene. Mecanu lleva el coche a tu taller, donde tienes elevador, herramienta y diagnóstico. El cliente gana la comodidad sin que tú pierdas las condiciones de trabajo.",
  },
  {
    q: "¿Qué pasa si el conductor daña el coche de mi cliente?",
    a: "Cada traslado incluye cobertura de responsabilidad civil para el vehículo en tránsito, activa desde que el conductor recibe las llaves hasta que el cliente firma la entrega. El taller no asume el riesgo del desplazamiento.",
  },
  {
    q: "¿Tengo que contratar conductores o comprar una furgoneta?",
    a: "No. Los conductores de Mecanu están verificados y se activan bajo demanda. No hay coste fijo ni alta laboral: pagas por traslado realizado, y en semanas flojas no pagas nada.",
  },
  {
    q: "¿En qué ciudades funciona Mecanu?",
    a: "Madrid y Barcelona, incluidas sus áreas metropolitanas, con un radio de hasta 40 km desde el taller. En Madrid cubrimos Alcobendas, Pozuelo, Las Rozas, Getafe, Leganés, Alcorcón, Móstoles, Alcalá y Torrejón. En Barcelona, L'Hospitalet, Badalona, Sabadell, Terrassa, Cornellà, Sant Cugat y El Prat.",
  },
  {
    q: "¿Sirve para llevar coches a la ITV?",
    a: "Sí, es uno de los usos más frecuentes. El taller gestiona la cita y Mecanu hace el trayecto de ida y vuelta sin que el cliente pierda la mañana. Lo mismo aplica para llevar un coche a chapa, a un especialista o entre dos naves propias.",
  },
  {
    q: "¿Necesito instalar algún programa en el taller?",
    a: "No. Mecanu es una aplicación web: se abre desde el ordenador de recepción o desde una tablet, sin instalar nada. Los conductores usan su propio móvil para documentar el traslado con fotos.",
  },
  {
    q: "¿Para qué tamaño de taller tiene sentido?",
    a: "Funciona mejor en talleres de 3 a 30 empleados con flujo constante de vehículos de cliente. Si reparas solo flotas propias o eres un concesionario con logística interna, probablemente no lo necesitas.",
  },
  {
    q: "¿Cuánto tarda un traslado?",
    a: "Se acuerda siempre una ventana de una hora, nunca una hora exacta, porque el tráfico de Madrid y Barcelona hace que prometer minutos sea mentir. Si no hay ventana confirmada, la ficha lo dice explícitamente en lugar de inventar una estimación.",
  },
  {
    q: "¿Puedo ver dónde está el coche mientras se mueve?",
    a: "Sí. El panel muestra el estado de cada traslado en tiempo real, con fotos del vehículo al recoger y al entregar, y registro de cada paso. Si un cliente llama preguntando, tienes la respuesta en pantalla.",
  },
] as const;
