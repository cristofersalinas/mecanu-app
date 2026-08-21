/**
 * Publica el paquete CSX semanal a partir del mock del repo.
 * En producción se sustituye por una query Postgres por taller.
 */
import { repo } from "@/lib/mecanu/repo";
import { TALLER } from "@/lib/mecanu/mecanu-data";
import { debeNudge } from "@/lib/slack/oportunidades";
import { construirSnapshotTallerSemana } from "@/lib/slack/csx-snapshot";
import { publicarPaqueteCsxSemanal } from "@/lib/slack/csx-flujo";
import type { SnapshotTallerSemana } from "@/lib/slack/csx";

export async function snapshotDemoDesdeRepo(ahora = new Date()): Promise<SnapshotTallerSemana> {
  const [vistas, campanas, conductores] = await Promise.all([
    repo.listRutasVista(),
    repo.listCampanas(),
    repo.listConductores(),
  ]);

  const conductorIdsUsados = vistas
    .map((v) => v.conductorId)
    .filter((id): id is string => Boolean(id));

  const estancadas = campanas.filter((c) => {
    if (!["nueva", "valorada", "enviada", "aceptada"].includes(c.estado)) return false;
    if (c.estado === "aceptada" && c.rutaGeneradaId) return false;
    const desde = c.presupuesto.actualizado ?? c.presupuesto.creado ?? c.fecha;
    return debeNudge({ estado: c.estado, desde, ahora });
  }).length;

  const citas: { quien: string; texto: string }[] = [];
  if (campanas.some((c) => c.estado === "enviada" || c.estado === "aceptada")) {
    citas.push({
      quien: "Cliente (mock)",
      texto: "¿Me recogéis el coche el jueves por la mañana?",
    });
  }
  if (campanas.some((c) => c.estado === "rechazada")) {
    citas.push({
      quien: "Cliente (mock)",
      texto: "De momento lo dejo, gracias.",
    });
  }

  return construirSnapshotTallerSemana({
    taller: TALLER.nombre,
    sucursal: "Talleres Rodríguez · Numància",
    plan: "basico",
    contactoNombre: "Rubén Ortega",
    contactoTelefono: "934 110 220",
    rutas: vistas,
    campanas,
    conductores,
    conductorIdsUsados,
    tareasManualesAbiertas: Math.min(12, campanas.filter((c) => c.estado === "nueva" || c.estado === "valorada").length * 2),
    oportunidadesEstancadas: estancadas,
    onboardingCompleto: true,
    citas,
    ahora,
  });
}

export async function ejecutarCsxSemanal(ahora = new Date()) {
  const snap = await snapshotDemoDesdeRepo(ahora);
  return publicarPaqueteCsxSemanal([snap], ahora);
}
