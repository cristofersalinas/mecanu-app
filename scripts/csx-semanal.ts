/**
 * Entrypoint CLI / GitHub Actions: Destacados CSX → Slack #csx.
 *
 *   SLACK_BOT_TOKEN=… SLACK_CHANNEL_CSX=C… npm run csx:semanal
 *   CSX_TIPO=upsell|subuso|destacados|paquete_semanal
 */
import { ejecutarCsxSemanal, snapshotDemoDesdeRepo } from "../src/lib/slack/csx-desde-repo";
import {
  publicarDestacadosSemana,
  publicarSubusoSiToca,
  publicarUpsellSiToca,
} from "../src/lib/slack/csx-flujo";
import { construirDestacados, labelSemana, textoDestacados } from "../src/lib/slack/csx";

async function main() {
  const tipo = process.env.CSX_TIPO || "paquete_semanal";
  const snap = await snapshotDemoDesdeRepo();
  console.log(
    `CSX ${tipo} · ${snap.taller} · autos=${snap.autosTrasladados} · plan=${snap.plan} · ofertas=${snap.ofertasEnviadas}`,
  );

  if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_CHANNEL_CSX) {
    console.warn("Sin SLACK_BOT_TOKEN o SLACK_CHANNEL_CSX: dry-run (no se publica).");
    console.log(textoDestacados(construirDestacados(snap, labelSemana())));
    return;
  }

  if (tipo === "paquete_semanal") {
    console.log(await ejecutarCsxSemanal());
  } else if (tipo === "destacados") {
    console.log(await publicarDestacadosSemana(snap));
  } else if (tipo === "upsell") {
    console.log(await publicarUpsellSiToca(snap));
  } else if (tipo === "subuso") {
    console.log(await publicarSubusoSiToca(snap));
  } else {
    console.error("CSX_TIPO desconocido:", tipo);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
