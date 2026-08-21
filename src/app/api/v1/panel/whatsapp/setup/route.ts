import { NextResponse } from "next/server";
import { asegurarSetupLink } from "@/lib/kapso/api";
import { exigirSesionPanelSiAplica } from "@/lib/kapso/sesion-panel";
import { origenPublicoDesdeRequest, redirectsWhatsApp } from "@/lib/kapso/urls";

/** Crea o reutiliza un setup link coexistence que vuelve al panel, no a Kapso. */
export async function POST(request: Request) {
  const bloqueo = await exigirSesionPanelSiAplica();
  if (bloqueo) return bloqueo;

  const origin = origenPublicoDesdeRequest(
    request.headers.get("origin"),
    new URL(request.url).origin,
  );
  const redirects = redirectsWhatsApp(origin);
  const setupUrl = await asegurarSetupLink({
    successRedirectUrl: redirects.ok,
    failureRedirectUrl: redirects.error,
  });

  if (!setupUrl) {
    return NextResponse.json(
      { error: "No hay link de conexión. Revisa KAPSO_API_KEY o KAPSO_SETUP_LINK_URL." },
      { status: 503 },
    );
  }

  return NextResponse.json({ setupUrl });
}
