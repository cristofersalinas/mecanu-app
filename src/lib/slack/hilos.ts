/**
 * Mapa en memoria oportunidadId → thread_ts de Slack.
 * Suficiente para el mock y un proceso Node; con varias instancias
 * serverless se perderá el hilo hasta que viva en Postgres.
 */
const hilos = new Map<string, { channel: string; threadTs: string }>();

export function recordarHiloOportunidad(
  oportunidadId: string,
  channel: string,
  threadTs: string,
): void {
  hilos.set(oportunidadId, { channel, threadTs });
}

export function hiloDeOportunidad(
  oportunidadId: string,
): { channel: string; threadTs: string } | null {
  return hilos.get(oportunidadId) ?? null;
}

export function resetHilosOportunidadForTests(): void {
  hilos.clear();
}
