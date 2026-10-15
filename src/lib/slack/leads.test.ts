import { describe, expect, it } from "vitest";
import { slackEscape } from "./notify";
import {
  digitosWhatsApp,
  enlaceWhatsApp,
  telefonoConPrefijo,
  textoLeadContacto,
  textoLeadItv,
} from "./leads";

describe("slackEscape", () => {
  it("rompe mrkdwn peligroso en texto de usuario", () => {
    expect(slackEscape("a <!channel> & b")).toBe("a &lt;!channel&gt; &amp; b");
  });
});

describe("telefonoConPrefijo / WhatsApp", () => {
  it("traduce ISO ES a +34", () => {
    expect(telefonoConPrefijo("ES", "633760969")).toBe("+34 633760969");
  });

  it("no duplica el prefijo si el número ya lo trae", () => {
    expect(digitosWhatsApp("ES", "34633760969")).toBe("34633760969");
    expect(enlaceWhatsApp("ES", "633760969")).toBe("https://wa.me/34633760969");
  });

  it("acepta prefijo ya numérico", () => {
    expect(telefonoConPrefijo("+34", "600111222")).toBe("+34 600111222");
  });
});

describe("textoLeadContacto", () => {
  it("muestra +34 y link wa.me, no el ISO", () => {
    const t = textoLeadContacto({
      nombre: "Ana",
      apellido: "Ruiz",
      email: "ana@taller.es",
      paisCodigo: "ES",
      telefono: "600111222",
      objetivo: "Empezar este mes",
      uso: ["Traslados", "ITV"],
      ciudad: "Madrid",
      volumen: "20-40",
      negocio: "Talleres Ruiz",
      canal: "Google",
    });
    expect(t).toContain("*Habla con Mecanu*");
    expect(t).toContain("+34 600111222");
    expect(t).not.toContain("ES 600");
    expect(t).toContain("<https://wa.me/34600111222|Abrir chat>");
  });

  it("marca el origen mapa como Postular taller", () => {
    const t = textoLeadContacto({
      nombre: "Luis",
      telefono: "600111222",
      paisCodigo: "ES",
      ciudad: "Barcelona",
      volumen: "Sin indicar",
      negocio: "Taller Norte",
      canal: "mapa",
    });
    expect(t).toContain("*Postular taller* — mapa");
    expect(t).not.toContain("*Habla con Mecanu*");
  });

  it("marca abandono del wizard", () => {
    const t = textoLeadContacto({
      nombre: "Ana",
      telefono: "600111222",
      paisCodigo: "ES",
      ciudad: "Madrid",
      volumen: "Sin indicar",
      canal: "abandono",
    });
    expect(t).toContain("*Formulario incompleto* — abandono 1 h");
  });
});

describe("textoLeadItv", () => {
  it("asume ES y añade WhatsApp", () => {
    const t = textoLeadItv({
      nombre: "Luis",
      telefono: "600000000",
      ciudad: "Madrid",
      caducada: "si",
      vehiculo: "turismo",
    });
    expect(t).toContain("*ITV a domicilio*");
    expect(t).toContain("+34 600000000");
    expect(t).toContain("Ya está caducada");
    expect(t).toContain("lo antes posible");
    expect(t).toContain("<https://wa.me/34600000000|Abrir chat>");
  });
});
