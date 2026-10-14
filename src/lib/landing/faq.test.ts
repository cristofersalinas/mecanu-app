import { describe, expect, it } from "vitest";
import { FAQ_LANDING, faqFor } from "./faq";

describe("faqFor", () => {
  it("el español visible coincide con la fuente histórica", () => {
    expect(faqFor("es")).toEqual(FAQ_LANDING);
  });

  it("cada idioma tiene las mismas preguntas, en su lengua", () => {
    for (const locale of ["es", "ca", "en", "pt"] as const) {
      expect(faqFor(locale)).toHaveLength(FAQ_LANDING.length);
    }
    expect(faqFor("en")[0]?.q).toMatch(/tow truck/i);
    expect(faqFor("ca")[0]?.q).toMatch(/grua/i);
    expect(faqFor("pt")[0]?.q).toMatch(/reboque/i);
    expect(faqFor("en").some((item) => item.q.includes("¿"))).toBe(false);
  });
});
