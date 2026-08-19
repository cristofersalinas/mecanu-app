/**
 * Condición de bloqueo del despliegue.
 *
 * Comprueba con un navegador real que en la landing NO se hace ninguna
 * petición a Google Tag Manager, Google Analytics ni Microsoft Clarity antes
 * de que el visitante acepte la categoría de analítica, y que SÍ se hacen
 * después. No mira el código: mira el tráfico de red que sale del navegador,
 * que es lo único que un regulador miraría.
 *
 * Uso:
 *   NEXT_PUBLIC_ANALYTICS_DEBUG=1 npm run build
 *   node scripts/verificar-consentimiento.mjs [url]
 *
 * Sale con código 1 si algo se carga cuando no debe, si nada se carga cuando
 * debería, o si no puede comprobarlo. Un "no lo sé" cuenta como fallo: es
 * preferible no publicar a publicar con un banner que no bloquea de verdad.
 */

import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:4010";

/** Dominios que solo pueden aparecer con consentimiento de analítica. */
const DOMINIOS_VIGILADOS = [
  "googletagmanager.com",
  "google-analytics.com",
  "analytics.google.com",
  "clarity.ms",
  "doubleclick.net",
];

const IDIOMAS = ["/", "/ca", "/en", "/pt"];

function esVigilado(url) {
  return DOMINIOS_VIGILADOS.some((dominio) => url.includes(dominio));
}

let fallos = 0;

function ok(mensaje) {
  console.log(`  OK      ${mensaje}`);
}

function fallo(mensaje) {
  console.log(`  FALLO   ${mensaje}`);
  fallos += 1;
}

async function nuevaPagina(navegador) {
  const contexto = await navegador.newContext();
  const pagina = await contexto.newPage();

  const peticiones = [];
  pagina.on("request", (peticion) => {
    const url = peticion.url();
    if (esVigilado(url)) peticiones.push(url);
  });

  return { contexto, pagina, peticiones };
}

/** Da tiempo a que un script inyectado dispare su petición antes de concluir
 *  que no existe. Sin esto, "no hay peticiones" podría significar solo
 *  "todavía no". */
async function reposar(pagina, ms = 2500) {
  await pagina.waitForTimeout(ms);
}

async function verificarIdioma(navegador, ruta) {
  console.log(`\n${ruta}`);
  const { contexto, pagina, peticiones } = await nuevaPagina(navegador);

  try {
    const respuesta = await pagina.goto(`${BASE}${ruta}`, { waitUntil: "networkidle" });
    if (!respuesta || respuesta.status() >= 400) {
      fallo(`la página no cargó (estado ${respuesta ? respuesta.status() : "sin respuesta"})`);
      return;
    }

    // 1. El banner tiene que estar visible: sin banner no hay consentimiento
    //    que dar, y todo lo demás sería vacuo.
    const banner = pagina.getByTestId("consent-banner");
    if (!(await banner.isVisible())) {
      fallo("el banner de consentimiento no aparece");
      return;
    }
    ok("el banner aparece en la primera visita");

    // 2. Nada de analítica antes de aceptar.
    await reposar(pagina);
    if (peticiones.length > 0) {
      fallo(`hay ${peticiones.length} peticiones de analítica ANTES de aceptar:`);
      for (const url of new Set(peticiones)) console.log(`            ${url}`);
      return;
    }
    ok("cero peticiones a GTM, GA4 y Clarity antes de aceptar");

    // 3. El estado por defecto de Consent Mode tiene que estar denegado.
    const porDefecto = await pagina.evaluate(() => {
      const capa = window.dataLayer ?? [];
      const entrada = capa.find(
        (item) => item && (item[0] === "consent" || item["0"] === "consent"),
      );
      if (!entrada) return null;
      return entrada[2] ?? entrada["2"] ?? null;
    });
    if (!porDefecto) {
      fallo("no se encontró el estado por defecto de Consent Mode en dataLayer");
    } else if (porDefecto.analytics_storage !== "denied") {
      fallo(`Consent Mode arranca con analytics_storage=${porDefecto.analytics_storage}`);
    } else {
      ok("Consent Mode arranca con analytics_storage=denied");
    }

    // 4. Rechazar tampoco puede cargar nada.
    await pagina.getByTestId("consent-rechazar").click();
    await reposar(pagina);
    if (peticiones.length > 0) {
      fallo(`hay ${peticiones.length} peticiones de analítica tras RECHAZAR`);
      for (const url of new Set(peticiones)) console.log(`            ${url}`);
      return;
    }
    ok("cero peticiones tras rechazar");

    // 5. La decisión persiste al recargar y el banner no vuelve.
    await pagina.reload({ waitUntil: "networkidle" });
    await reposar(pagina, 1500);
    if (await pagina.getByTestId("consent-banner").isVisible()) {
      fallo("el banner vuelve a salir tras haber rechazado (no persiste)");
    } else {
      ok("la decisión persiste al recargar");
    }
    if (peticiones.length > 0) {
      fallo("hay peticiones de analítica tras recargar con rechazo guardado");
      return;
    }
    ok("cero peticiones tras recargar con rechazo guardado");
  } finally {
    await contexto.close();
  }
}

async function verificarAceptacion(navegador) {
  console.log("\naceptar todo");
  const { contexto, pagina, peticiones } = await nuevaPagina(navegador);

  try {
    await pagina.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await pagina.getByTestId("consent-aceptar").click();
    await reposar(pagina, 4000);

    const gtm = peticiones.filter((u) => u.includes("googletagmanager.com"));
    const clarity = peticiones.filter((u) => u.includes("clarity.ms"));

    if (gtm.length === 0) {
      fallo("tras ACEPTAR no se cargó GTM — el consentimiento no activa nada");
    } else {
      ok(`GTM carga tras aceptar (${gtm.length} peticiones)`);
    }

    if (clarity.length === 0) {
      fallo("tras ACEPTAR no se cargó Clarity");
    } else {
      ok(`Clarity carga tras aceptar (${clarity.length} peticiones)`);
    }

    const actualizado = await pagina.evaluate(() => {
      const capa = window.dataLayer ?? [];
      const entradas = capa.filter(
        (item) => item && (item[0] === "consent" || item["0"] === "consent"),
      );
      const ultima = entradas[entradas.length - 1];
      if (!ultima) return null;
      return ultima[2] ?? ultima["2"] ?? null;
    });
    if (actualizado?.analytics_storage === "granted") {
      ok("Consent Mode pasa a analytics_storage=granted");
    } else {
      fallo(`Consent Mode no pasó a granted (${JSON.stringify(actualizado)})`);
    }
  } finally {
    await contexto.close();
  }
}

async function verificarGestionPorCategorias(navegador) {
  console.log("\ngestionar categorías: solo analítica");
  const { contexto, pagina, peticiones } = await nuevaPagina(navegador);

  try {
    await pagina.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await pagina.getByTestId("consent-gestionar").click();

    const casillas = pagina.locator('[class*="consentCategoria"] input[type="checkbox"]');
    await casillas.nth(1).check(); // analítica
    await pagina.getByTestId("consent-guardar").click();
    await reposar(pagina, 4000);

    if (peticiones.some((u) => u.includes("googletagmanager.com"))) {
      ok("aceptar solo analítica carga GTM");
    } else {
      fallo("aceptar solo analítica no cargó GTM");
    }

    const señales = await pagina.evaluate(() => {
      const capa = window.dataLayer ?? [];
      const entradas = capa.filter(
        (item) => item && (item[0] === "consent" || item["0"] === "consent"),
      );
      const ultima = entradas[entradas.length - 1];
      return ultima ? (ultima[2] ?? ultima["2"] ?? null) : null;
    });

    if (señales?.analytics_storage === "granted" && señales?.ad_storage === "denied") {
      ok("marketing sigue denegado al aceptar solo analítica");
    } else {
      fallo(`las categorías no se respetan por separado (${JSON.stringify(señales)})`);
    }
  } finally {
    await contexto.close();
  }
}

async function verificarPanelYConductor(navegador) {
  console.log("\npanel y conductor: sin analítica de la landing");
  const { contexto, pagina, peticiones } = await nuevaPagina(navegador);

  try {
    for (const ruta of ["/panel", "/conductor"]) {
      const respuesta = await pagina.goto(`${BASE}${ruta}`, { waitUntil: "networkidle" });
      if (!respuesta) {
        fallo(`${ruta} no respondió`);
        continue;
      }
      await reposar(pagina, 1500);
      if (await pagina.getByTestId("consent-banner").isVisible().catch(() => false)) {
        fallo(`${ruta} muestra el banner de cookies de la landing`);
      } else {
        ok(`${ruta} no monta el banner de la landing`);
      }
    }

    if (peticiones.length > 0) {
      fallo("el panel o el conductor piden analítica de la landing");
      for (const url of new Set(peticiones)) console.log(`            ${url}`);
    } else {
      ok("cero peticiones de analítica desde panel y conductor");
    }
  } finally {
    await contexto.close();
  }
}

const navegador = await chromium.launch();

try {
  console.log(`Verificando el consentimiento contra ${BASE}`);
  for (const ruta of IDIOMAS) await verificarIdioma(navegador, ruta);
  await verificarAceptacion(navegador);
  await verificarGestionPorCategorias(navegador);
  await verificarPanelYConductor(navegador);
} catch (error) {
  console.error("\nLa verificación se interrumpió:", error);
  fallos += 1;
} finally {
  await navegador.close();
}

console.log("");
if (fallos > 0) {
  console.log(`RESULTADO: ${fallos} comprobación(es) fallida(s). NO DESPLEGAR.`);
  process.exit(1);
}
console.log("RESULTADO: consentimiento verificado. GA4 y Clarity no cargan sin permiso.");
