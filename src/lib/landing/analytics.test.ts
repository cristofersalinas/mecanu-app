import { describe, expect, it } from "vitest";
import { GTM_ID, gtmSnippet } from "./analytics";

describe("gtmSnippet", () => {
  it("es el snippet oficial con el id del contenedor, una sola vez", () => {
    const snippet = gtmSnippet(GTM_ID);
    expect(snippet).toContain("https://www.googletagmanager.com/gtm.js?id=");
    expect(snippet).toContain("GTM-T8TJGTJQ");
    expect(snippet.match(/GTM-T8TJGTJQ/g)).toHaveLength(1);
    expect(snippet).not.toContain("gtag/js");
  });
});
