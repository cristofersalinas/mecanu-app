import { describe, expect, it } from "vitest";
import { slackEscape } from "./notify";
import { textoLeadContacto, textoLeadItv } from "./leads";

describe("slackEscape", () => {
  it("rompe mrkdwn peligroso en texto de usuario", () => {
    expect(slackEscape("a <!channel> & b")).toBe("a &lt;!channel&gt; &amp; b");
  });
});

describe("textoLeadContacto", () => {
  it("titula Habla con Mecanu y no inventa datos", () => {
    const t = textoLeadContacto({
      nombre: "Ana",
      apellido: "Ruiz",
      email: "ana@taller.es",
      paisCodigo: "+34",
      telefono: "600111222",
      objetivo: "Empezar este mes",
      tipoTaller: "Mecánica general",
      uso: ["Traslados", "ITV"],
      ciudad: "Madrid",
      volumen: "20-40",
      negocio: "Talleres Ruiz",
      canal: "Google",
    });
    expect(t).toContain("*Habla con Mecanu*");
    expect(t).toContain("Talleres Ruiz");
    expect(t).toContain("+34 600111222");
    expect(t).not.toContain("Pendiente de agendar");
  });
});

describe("textoLeadItv", () => {
  it("traduce caducada y no inventa fecha", () => {
    const t = textoLeadItv({
      nombre: "Luis",
      telefono: "600000000",
      ciudad: "Madrid",
      caducada: "si",
      vehiculo: "turismo",
    });
    expect(t).toContain("*ITV a domicilio*");
    expect(t).toContain("Ya está caducada");
    expect(t).toContain("lo antes posible");
  });
});
