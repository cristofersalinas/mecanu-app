import { afterEach, describe, expect, it, vi } from "vitest";
import type { EventoSeguridad } from "@/lib/security/events";
import {
  DEDUPE_P0_MS,
  debeAvisarP0Slack,
  esTipoP0Slack,
  textoAlertaSeguridadP0,
} from "./seguridad";

function evento(parcial: Partial<EventoSeguridad> = {}): EventoSeguridad {
  return {
    tipo: "sondeo_sistematico",
    ts: new Date().toISOString(),
    ip: "203.0.113.44",
    geo: { pais: "RU", region: "MOW", ciudad: "Moscow" },
    userAgent: "python-requests/2.31.0",
    metodo: "GET",
    ruta: "/.env",
    tecnica: null,
    resumen: "5 señuelos",
    ...parcial,
  };
}

describe("esTipoP0Slack", () => {
  it("solo los tres críticos", () => {
    expect(esTipoP0Slack("canary_used")).toBe(true);
    expect(esTipoP0Slack("honeypot_hit")).toBe(false);
    expect(esTipoP0Slack("fake_login")).toBe(false);
  });
});

describe("debeAvisarP0Slack", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("avisa la primera vez y dedupea la misma IP+tipo", () => {
    const store = new Map<string, number>();
    const e = evento();
    expect(debeAvisarP0Slack(e, 1_000, store)).toBe(true);
    expect(debeAvisarP0Slack(e, 1_000 + 60_000, store)).toBe(false);
  });

  it("vuelve a avisar tras la ventana de dedupe", () => {
    const store = new Map<string, number>();
    const e = evento();
    expect(debeAvisarP0Slack(e, 1_000, store)).toBe(true);
    expect(debeAvisarP0Slack(e, 1_000 + DEDUPE_P0_MS + 1, store)).toBe(true);
  });

  it("otra IP no comparte dedupe", () => {
    const store = new Map<string, number>();
    expect(debeAvisarP0Slack(evento({ ip: "1.1.1.1" }), 1_000, store)).toBe(true);
    expect(debeAvisarP0Slack(evento({ ip: "2.2.2.2" }), 1_000, store)).toBe(true);
  });
});

describe("textoAlertaSeguridadP0", () => {
  it("lleva P0, tag y acción", () => {
    const t = textoAlertaSeguridadP0(evento());
    expect(t).toContain("[P0 · CRITICA]");
    expect(t).toContain("#sondeo");
    expect(t).toContain("203.0.113.44");
    expect(t).toContain("IP Blocking");
  });

  it("escapa mrkdwn del user-agent", () => {
    const t = textoAlertaSeguridadP0(evento({ userAgent: "x <!channel> y" }));
    expect(t).toContain("&lt;!channel&gt;");
  });
});
