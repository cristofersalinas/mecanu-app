/**
 * Orquesta aviso de oportunidad: abre hilo o comenta.
 */
import {
  esAperturaHilo,
  textoAperturaOportunidad,
  textoComentarioOportunidad,
  type EventoOportunidad,
} from "./oportunidades";
import { hiloDeOportunidad, recordarHiloOportunidad } from "./hilos";
import { avisarOportunidadSlack, type SlackPostResult } from "./notify";

export async function publicarEventoOportunidad(
  ev: EventoOportunidad,
): Promise<SlackPostResult & { modo?: "apertura" | "comentario" }> {
  const existente = hiloDeOportunidad(ev.oportunidad.id);
  const abrir = esAperturaHilo(ev.tipo, !!existente);

if (abrir) {
    const text = textoAperturaOportunidad(ev);
    const r = await avisarOportunidadSlack({ text });
    if (r.status === "ok") {
      recordarHiloOportunidad(ev.oportunidad.id, r.channel, r.ts);
    }
    return { ...r, modo: "apertura" };
  }

  // Reutilización de campaña (mismo id): comentar en el hilo existente.
  const text =
    ev.tipo === "creada"
      ? `*Comentario:* se registró de nuevo (mismo id). Estado sigue «${ev.oportunidad.estado}». ${ev.actor ? `Actor: ${ev.actor.nombre} [${ev.actor.rol}].` : ""}`
      : textoComentarioOportunidad(ev);
  const r = await avisarOportunidadSlack({
    text,
    threadTs: existente!.threadTs,
  });
  return { ...r, modo: "comentario" };
}
