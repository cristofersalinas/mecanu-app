/**
 * Genera `src/app/favicon.ico` a partir de `src/app/icon.svg`.
 *
 * El SVG es la fuente de verdad; el .ico es el respaldo para los navegadores
 * que no admiten favicons en SVG (Safari, sobre todo). Existe este script para
 * que ese binario no sea un archivo opaco que nadie sabe regenerar: si cambia
 * el icono, se vuelve a ejecutar y ya.
 *
 *   node scripts/generar-favicon.mjs
 *
 * El .ico va siempre en negro. El formato no admite variantes por tema, así
 * que no puede adaptarse al modo oscuro como sí hace el SVG.
 */

import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const ORIGEN = "src/app/icon.svg";
const DESTINO = "src/app/favicon.ico";

/** Los tres tamaños que un navegador pide de verdad: pestaña, pestaña en
 *  pantalla densa, y barra de marcadores o escritorio. */
const TAMANOS = [16, 32, 48];

/**
 * Empaqueta varios PNG en un contenedor ICO.
 *
 * Cabecera de 6 bytes, una entrada de directorio de 16 por imagen, y después
 * los PNG tal cual. Windows Vista en adelante y todos los navegadores actuales
 * leen PNG dentro de ICO, así que no hace falta convertir a BMP.
 */
function empaquetarIco(imagenes) {
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0); // reservado
  cabecera.writeUInt16LE(1, 2); // 1 = icono
  cabecera.writeUInt16LE(imagenes.length, 4);

  const directorio = Buffer.alloc(16 * imagenes.length);
  let desplazamiento = cabecera.length + directorio.length;

  imagenes.forEach(({ tamano, png }, i) => {
    const base = i * 16;
    // 0 significa 256 en este campo; con nuestros tamaños no llega a darse.
    directorio.writeUInt8(tamano >= 256 ? 0 : tamano, base);
    directorio.writeUInt8(tamano >= 256 ? 0 : tamano, base + 1);
    directorio.writeUInt8(0, base + 2); // colores de la paleta: ninguna
    directorio.writeUInt8(0, base + 3); // reservado
    directorio.writeUInt16LE(1, base + 4); // planos de color
    directorio.writeUInt16LE(32, base + 6); // bits por pixel
    directorio.writeUInt32LE(png.length, base + 8);
    directorio.writeUInt32LE(desplazamiento, base + 12);
    desplazamiento += png.length;
  });

  return Buffer.concat([cabecera, directorio, ...imagenes.map((i) => i.png)]);
}

const svg = readFileSync(ORIGEN, "utf8");
const uri = "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");

const navegador = await chromium.launch();
const imagenes = [];

try {
  // Esquema claro forzado: el .ico se congela en negro, y con el contexto en
  // oscuro el SVG se dibujaria en blanco.
  const contexto = await navegador.newContext({ colorScheme: "light" });

  for (const tamano of TAMANOS) {
    const pagina = await contexto.newPage();
    await pagina.setViewportSize({ width: tamano, height: tamano });
    await pagina.setContent(
      `<body style="margin:0"><img src="${uri}" width="${tamano}" height="${tamano}"></body>`,
    );
    // `omitBackground` es lo que conserva la transparencia que pidio el diseno.
    const png = await pagina.screenshot({ omitBackground: true });
    imagenes.push({ tamano, png });
    await pagina.close();
  }
} finally {
  await navegador.close();
}

writeFileSync(DESTINO, empaquetarIco(imagenes));
console.log(`${DESTINO}: ${TAMANOS.join(", ")} px`);
