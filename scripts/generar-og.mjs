/**
 * Genera las imagenes de vista previa (Open Graph) que se ven al compartir el
 * enlace por WhatsApp, LinkedIn, Slack o Telegram. Una por idioma, en
 * `public/og/`.
 *
 *   node scripts/generar-og.mjs
 *
 * Por que estaticas y no `next/og`: satori necesita que le pases el binario de
 * la fuente, y la unica forma de conseguir Inter Tight en build seria
 * descargarla de Google Fonts en cada build o comprometer el .ttf en el repo.
 * Generarlas aqui una vez con un navegador de verdad quita esa dependencia de
 * red del build, deja el coste en cero en tiempo de ejecucion y permite mirar
 * el resultado antes de publicarlo, que en algo cuyo unico proposito es como
 * se ve importa bastante.
 *
 * 1200x630 es el tamano que piden todos: es lo que declara `metadata.ts`, y
 * declarar unas medidas que la imagen no tiene es justamente lo que hacia que
 * WhatsApp recortara mal.
 */

import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "node:fs";

const ANCHO = 1200;
const ALTO = 630;
const SALIDA = "public/og";

const IDIOMAS = ["es", "ca", "en", "pt"];

/**
 * Saca el logotipo del componente del design system en vez de copiar los
 * trazados aqui. Asi no hay dos versiones del logo que puedan divergir: si
 * cambia `Logo.tsx`, se vuelve a ejecutar este script y ya.
 */
function leerLogotipo() {
  const fuente = readFileSync("src/components/ds/Logo.tsx", "utf8");

  const viewBox = fuente.match(/viewBox="([^"]+)"/)?.[1];
  const trazados = [...fuente.matchAll(/d="(M[^"]+)"/g)].map((m) => m[1]);

  if (!viewBox || trazados.length === 0) {
    throw new Error(
      "No se pudo extraer el logotipo de src/components/ds/Logo.tsx. " +
        "Si cambio la forma del componente, hay que ajustar este script.",
    );
  }

  return `<svg viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg"
    style="height:46px;width:auto;display:block">
    ${trazados.map((d) => `<path d="${d}" fill="#fff"/>`).join("")}
  </svg>`;
}

/**
 * El mismo volante del favicon, en blanco, como sello de marca.
 *
 * Se define `--icono` a mano porque al quedarnos solo con las figuras dejamos
 * fuera el `<style>` del archivo original, y sin esa variable los trazos caen
 * al negro de reserva, que sobre este fondo es invisible.
 */
function leerVolante() {
  const svg = readFileSync("src/app/icon.svg", "utf8");
  const figuras = svg.slice(svg.indexOf("<g"), svg.lastIndexOf("</svg>"));
  return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
    style="--icono:#fff;width:420px;height:420px;display:block">${figuras}</svg>`;
}

/**
 * Lee el copy compilando `copy.ts` con el propio Next no es posible desde un
 * script suelto, asi que se extrae con una expresion regular por bloque de
 * idioma. Falla ruidosamente si no encuentra algo.
 */
function leerCopy() {
  const fuente = readFileSync("src/lib/landing/copy.ts", "utf8");
  const resultado = {};

  for (const idioma of IDIOMAS) {
    const inicio = fuente.indexOf(`const ${idioma}: LandingCopy = {`);
    if (inicio === -1) throw new Error(`No encuentro el bloque de copy de "${idioma}"`);

    const siguiente = IDIOMAS.map((otro) =>
      otro === idioma ? -1 : fuente.indexOf(`const ${otro}: LandingCopy = {`),
    ).filter((pos) => pos > inicio);
    const bloque = fuente.slice(inicio, siguiente.length ? Math.min(...siguiente) : undefined);

    const headline = bloque.match(/headline:\s*"([^"]+)"/)?.[1];
    const descripcion = bloque.match(/description:\s*\n?\s*"([^"]+)"/)?.[1];

    if (!headline || !descripcion) {
      throw new Error(`Falta headline o description en el copy de "${idioma}"`);
    }
    resultado[idioma] = { headline, descripcion };
  }

  return resultado;
}

function plantilla({ headline, descripcion }, logotipo, volante) {
  return `<!doctype html><html><head><meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&display=block"
        rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width:${ANCHO}px; height:${ALTO}px;
      background:#0f0f0f; color:#fff;
      font-family:"Inter Tight",sans-serif;
      padding:68px 72px;
      display:flex; flex-direction:column; justify-content:space-between;
      position:relative; overflow:hidden;
    }
    /* El volante asoma cortado por el borde derecho, como sello de marca. */
    .sello {
      position:absolute; right:-118px; top:50%;
      margin-top:-210px; opacity:.14; transform:rotate(-14deg);
    }
    /* El texto se mantiene estrecho para que nunca pase por debajo del sello. */
    h1 {
      font-size:76px; font-weight:500; line-height:1.03;
      letter-spacing:-.025em; max-width:820px;
    }
    p { font-size:29px; line-height:1.4; color:#9ca3af; max-width:760px; margin-top:24px; }
  </style></head>
  <body>
    <div class="sello">${volante}</div>
    <div>${logotipo}</div>
    <div>
      <h1>${headline}</h1>
      <p>${descripcion}</p>
    </div>
  </body></html>`;
}

const logotipo = leerLogotipo();
const volante = leerVolante();
const copy = leerCopy();

mkdirSync(SALIDA, { recursive: true });

const navegador = await chromium.launch();

try {
  const contexto = await navegador.newContext({
    viewport: { width: ANCHO, height: ALTO },
    deviceScaleFactor: 1,
  });

  for (const idioma of IDIOMAS) {
    const pagina = await contexto.newPage();
    await pagina.setContent(plantilla(copy[idioma], logotipo, volante), {
      waitUntil: "networkidle",
    });
    // Sin esto la captura puede salir con la fuente de reserva.
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.screenshot({ path: `${SALIDA}/${idioma}.png` });
    await pagina.close();
    console.log(`${SALIDA}/${idioma}.png`);
  }
} finally {
  await navegador.close();
}
