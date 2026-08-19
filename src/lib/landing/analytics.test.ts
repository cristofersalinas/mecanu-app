import { describe, expect, it } from "vitest";
import { CLARITY_ID, GTM_ID, claritySnippet, gtmSnippet } from "./analytics";

describe("gtmSnippet", () => {
  it("es el snippet oficial con el id del contenedor, una sola vez", () => {
    const snippet = gtmSnippet(GTM_ID);
    expect(snippet).toContain("https://www.googletagmanager.com/gtm.js?id=");
    expect(snippet).toContain("GTM-T8TJGTJQ");
    expect(snippet.match(/GTM-T8TJGTJQ/g)).toHaveLength(1);
    expect(snippet).not.toContain("gtag/js");
  });
});

describe("claritySnippet", () => {
  it("es el snippet oficial con el id del proyecto, una sola vez", () => {
    const snippet = claritySnippet(CLARITY_ID);
    expect(snippet).toContain("https://www.clarity.ms/tag/");
    expect(snippet).toContain("y4kpmlt67l");
    expect(snippet.match(/y4kpmlt67l/g)).toHaveLength(1);
  });
});
