import { describe, expect, it } from "vitest";
import {
  esInboxEmbedUrl,
  esSetupUrl,
  origenPublicoDesdeRequest,
  redirectsWhatsApp,
} from "./urls";

describe("esInboxEmbedUrl", () => {
  it("acepta el embed de Kapso", () => {
    expect(esInboxEmbedUrl("https://inbox.kapso.ai/embed/abc.def")).toBe(true);
  });

  it("rechaza hosts y esquemas ajenos", () => {
    expect(esInboxEmbedUrl("https://evil.example/embed/abc")).toBe(false);
    expect(esInboxEmbedUrl("http://inbox.kapso.ai/embed/abc")).toBe(false);
    expect(esInboxEmbedUrl("https://inbox.kapso.ai/")).toBe(false);
    expect(esInboxEmbedUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("esSetupUrl", () => {
  it("acepta el setup de Kapso en español", () => {
    expect(
      esSetupUrl("https://app.kapso.ai/whatsapp/setup/NIaaX5Oqt6FPsgCsO9diU9srrjznnCdaPy-nvhiWi8s?lang=es"),
    ).toBe(true);
  });

  it("rechaza un dashboard genérico", () => {
    expect(esSetupUrl("https://app.kapso.ai/inbox")).toBe(false);
    expect(esSetupUrl("https://facebook.com/login")).toBe(false);
  });
});

describe("origenPublicoDesdeRequest", () => {
  it("usa localhost del Origin", () => {
    expect(origenPublicoDesdeRequest("http://localhost:3000", "http://localhost:3000")).toBe(
      "http://localhost:3000",
    );
  });

  it("no usa un origin ajeno", () => {
    expect(origenPublicoDesdeRequest("http://evil.example", "http://localhost:3000")).toBe(
      "http://localhost:3000",
    );
    expect(origenPublicoDesdeRequest("https://evil.example", "http://localhost:3000")).toBe(
      "http://localhost:3000",
    );
  });

  it("acepta mecanu.com y previews de Vercel", () => {
    expect(origenPublicoDesdeRequest("https://mecanu.com", "http://localhost:3000")).toBe(
      "https://mecanu.com",
    );
    expect(
      origenPublicoDesdeRequest("https://mecanu-app-git-foo.vercel.app", "http://localhost:3000"),
    ).toBe("https://mecanu-app-git-foo.vercel.app");
  });
});

describe("redirectsWhatsApp", () => {
  it("vuelve al panel, no al dashboard de Kapso", () => {
    const r = redirectsWhatsApp("http://localhost:3000");
    expect(r.ok).toBe("http://localhost:3000/panel?whatsapp=ok");
    expect(r.error).toBe("http://localhost:3000/panel?whatsapp=error");
  });
});
