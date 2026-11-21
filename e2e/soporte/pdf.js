// Descarga de PDF desde un botón de la interfaz y lectura de su texto (HE-07).
//
// Los reportes los genera pdf-lib en el back: cada línea es un operador Tj con el texto en
// hexadecimal (WinAnsi) dentro de un stream comprimido con Flate. Se descomprime con zlib de Node
// y se decodifica, sin dependencias nuevas. Solo sirve para buscar textos, no para el diseño.

import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import { expect } from '@playwright/test';

/** Texto del PDF, una línea por cada operador Tj. */
export function textoDelPdf(buffer) {
  const crudo = buffer.toString('latin1');
  const lineas = [];
  const inicioStream = /stream\r?\n/g;
  let encontrado;
  while ((encontrado = inicioStream.exec(crudo))) {
    const inicio = encontrado.index + encontrado[0].length;
    const fin = crudo.indexOf('endstream', inicio);
    if (fin === -1) break;
    const bytes = buffer.subarray(inicio, fin);
    let contenido;
    try {
      contenido = inflateSync(bytes).toString('latin1');
    } catch {
      contenido = bytes.toString('latin1');
    }
    for (const [, hex] of contenido.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)) {
      lineas.push(Buffer.from(hex, 'hex').toString('latin1'));
    }
  }
  return lineas.join('\n');
}

/**
 * Pulsa el botón, espera la descarga y devuelve su nombre y su texto. Comprueba que es un PDF.
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} boton
 */
export async function descargarPdf(page, boton) {
  const [descarga] = await Promise.all([page.waitForEvent('download'), boton.click()]);
  const buffer = await readFile(await descarga.path());
  expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
  return { nombre: descarga.suggestedFilename(), texto: textoDelPdf(buffer) };
}
