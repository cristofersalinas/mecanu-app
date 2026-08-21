/**
 * Cliente del panel: notifica a Slack sin bloquear la UI.
 * Si falla la red o Slack no está cableado, se ignora (el panel sigue).
 */
import type { PresupuestoEstado } from "@/lib/mecanu/types";

export type PayloadSlackOportunidad = {
  tipo: "creada" | "cambio_estado" | "ruta_creada" | "nudge" | "escanear_nudges";
  oportunidad?: {
    id: string;
    estado: PresupuestoEstado;
    valor: number;
    matricula: string;
    vehiculoLabel: string;
    servicioLabel: string;
    creadaEn: string;
    actualizadaEn: string;
    taller: { taller: string; sucursal: string };
  };
  actor?: { nombre: string; rol: string };
  desde?: PresupuestoEstado;
  detalle?: string;
  oportunidades?: NonNullable<PayloadSlackOportunidad["oportunidad"]>[];
  ahora?: string;
};

export function notificarOportunidadSlack(payload: PayloadSlackOportunidad): void {
  if (typeof window === "undefined") return;
  const body = JSON.stringify(payload);
  const key =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `op-${Date.now()}`;

  void fetch("/api/v1/oportunidades/slack-evento", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Idempotency-Key": key,
    },
    body,
    keepalive: true,
  }).catch(() => {
    /* silencioso: Slack es observabilidad, no camino crítico del taller */
  });
}
