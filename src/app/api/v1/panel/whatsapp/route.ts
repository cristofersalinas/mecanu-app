import { NextResponse } from "next/server";
import {
  asegurarSetupLink,
  inboxEmbedUrlDesdeEnv,
  listarNumerosKapso,
  setupUrlDesdeEnv,
} from "@/lib/kapso/api";
import { tallerWhatsappConectado } from "@/lib/kapso/numeros";
import { exigirSesionPanelSiAplica } from "@/lib/kapso/sesion-panel";
import {
  esInboxEmbedUrl,
  esSetupUrl,
  origenPublicoDesdeRequest,
  redirectsWhatsApp,
} from "@/lib/kapso/urls";

export async function GET(request: Request) {
  const bloqueo = await exigirSesionPanelSiAplica();
  if (bloqueo) return bloqueo;

  const inboxRaw = inboxEmbedUrlDesdeEnv();
  const inboxEmbedUrl = inboxRaw && esInboxEmbedUrl(inboxRaw) ? inboxRaw : null;

  const origin = origenPublicoDesdeRequest(
    request.headers.get("origin"),
    new URL(request.url).origin,
  );
  const redirects = redirectsWhatsApp(origin);
  const setupRaw = setupUrlDesdeEnv();
  const setupUrl =
    setupRaw && esSetupUrl(setupRaw)
      ? setupRaw
      : await asegurarSetupLink({
          successRedirectUrl: redirects.ok,
          failureRedirectUrl: redirects.error,
        });

  const numeros = await listarNumerosKapso();

  return NextResponse.json({
    inboxEmbedUrl,
    setupUrl,
    conectado: tallerWhatsappConectado(numeros),
    sandboxListo: numeros.some((n) => n.sandbox) || !!inboxEmbedUrl,
    numeros: numeros.map((n) => ({
      phoneNumberId: n.phoneNumberId,
      kind: n.kind,
      displayPhoneNumber: n.displayPhoneNumber,
      sandbox: n.sandbox,
    })),
  });
}
