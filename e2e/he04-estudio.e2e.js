// HE-04 — Repaso Adaptativo y Enriquecimiento Léxico (HU-4.1, HU-4.2), con sesión de estudiante
//
// María estudia en las pruebas de HU-4.1 y Juan en la de "Repetir" (recorre todo el mazo), para
// que el progreso SM-2 de uno no cambie el orden de las tarjetas del otro. Ninguna otra prueba
// usa su progreso de estudio. El orden de las tarjetas no se da por sabido: se lee de la API, así
// las pruebas siguen valiendo si se repiten (en CI hay 1 reintento) sobre una base ya estudiada.

import { test, expect } from '@playwright/test';
import { api, iniciarSesion, USUARIOS } from './soporte/sesion.js';

/** Tarjetas de la sesión de repaso, en el orden en que el back las entrega (SM-2). */
async function sesionDe(estudiante) {
  // Misma consulta que AuthProvider.jsx para conocer la inscripción del estudiante.
  const { id_inscripcion } = await api('GET', `/students/${USUARIOS[estudiante].id_usuario}/context`, estudiante);
  return api('POST', '/study/review-session', estudiante, { inscripcion_id: id_inscripcion });
}

/** Cara de la tarjeta: el frente lleva la palabra; el dorso, traducción, definición y ejemplo. */
const frente = (page) => page.locator('.estudiar-cara--frente');
const dorso = (page) => page.locator('.estudiar-cara--dorso');
const palabraActual = (page) => frente(page).locator('.estudiar-palabra');

/** Botón de valoración: su nombre accesible es "Good (key 3)". */
const boton = (page, valoracion) => page.getByRole('button', { name: new RegExp(`^${valoracion} \\(key`) });

async function abrirEstudio(page, context, estudiante) {
  await iniciarSesion(context, estudiante);
  await page.goto('/estudiante/estudio');
  await expect(page.getByRole('progressbar', { name: 'Session progress' })).toBeVisible();
}

test.describe('HU-4.1 — Estudiar con repetición espaciada', () => {
  test('CA-4.1.1 La flashcard muestra la palabra y, al girarla, revela traducción, definición y ejemplo', async ({ page, context }) => {
    const { tarjetas } = await sesionDe('maria');
    const primera = tarjetas[0];
    await abrirEstudio(page, context, 'maria');

    await expect(page.getByText(`Card 1 of ${tarjetas.length}`)).toBeVisible();
    await expect(palabraActual(page)).toHaveText(primera.palabra);
    await expect(dorso(page)).toHaveAttribute('aria-hidden', 'true');
    // No se puede valorar sin haber visto la respuesta.
    await expect(boton(page, 'Good')).toBeDisabled();

    await page.getByRole('button', { name: 'Flip card' }).click();

    await expect(dorso(page)).toHaveAttribute('aria-hidden', 'false');
    await expect(dorso(page)).toContainText(primera.traduccion);
    await expect(dorso(page)).toContainText(primera.definicion);
    await expect(dorso(page)).toContainText(primera.ejemplo);
    await expect(boton(page, 'Good')).toBeEnabled();
  });

  test('CA-4.1.2 Al valorar la tarjeta, SM-2 programa el próximo repaso y el back lo guarda', async ({ page, context }) => {
    const { tarjetas } = await sesionDe('maria');
    const primera = tarjetas[0];
    await abrirEstudio(page, context, 'maria');

    await page.getByRole('button', { name: 'Flip card' }).click();
    await boton(page, 'Good').click();

    await expect(page.getByText(/^Saved\. Next review in \d+ days?\.$/)).toBeVisible();
    await expect(page.getByText(`Card 2 of ${tarjetas.length}`)).toBeVisible();
    await expect(palabraActual(page)).not.toHaveText(primera.palabra);

    // El progreso quedó en la base: valoración, intervalo y fecha del próximo repaso.
    const despues = await sesionDe('maria');
    const progreso = despues.tarjetas.find((t) => t.id_tarjeta === primera.id_tarjeta).progreso;
    expect(progreso).toMatchObject({ ultima_valoracion: 'Buena' });
    expect(progreso.intervalo_dias).toBeGreaterThanOrEqual(1);
    expect(new Date(progreso.fecha_proximo_repaso).getTime()).toBeGreaterThan(Date.now());

    // Al volver a entrar, la tarjeta recién valorada ya no es la primera: SM-2 la mandó atrás.
    await page.reload();
    await expect(palabraActual(page)).toHaveText(despues.tarjetas[0].palabra);
    await expect(palabraActual(page)).not.toHaveText(primera.palabra);
  });

  test('CA-4.1.2 También se estudia con el teclado: Espacio gira y 1-4 valoran', async ({ page, context }) => {
    await abrirEstudio(page, context, 'maria');
    const palabra = await palabraActual(page).textContent();

    await page.keyboard.press('Space');
    await expect(dorso(page)).toHaveAttribute('aria-hidden', 'false');
    await page.keyboard.press('4'); // Fácil

    await expect(page.getByText(/^Saved\. Next review in \d+ days?\.$/)).toBeVisible();
    await expect(palabraActual(page)).not.toHaveText(palabra);
  });

  test('CA-4.1.3 Una tarjeta marcada "Repetir" vuelve al final del bloque y al terminar se ve el resumen', async ({ page, context }) => {
    test.slow(); // recorre todo el mazo: una valoración por tarjeta

    const { tarjetas } = await sesionDe('juan');
    const total = tarjetas.length;
    await abrirEstudio(page, context, 'juan');
    const repetida = await palabraActual(page).textContent();

    await page.getByRole('button', { name: 'Flip card' }).click();
    await boton(page, 'Repeat').click();
    await expect(page.getByText('Saved. This card will return at the end of the session.')).toBeVisible();
    // "Repetir" no cuenta como tarjeta completada.
    await expect(page.getByText(`Card 1 of ${total}`)).toBeVisible();

    // Las demás tarjetas, todas con "Buena".
    for (let n = 2; n <= total; n++) {
      await page.getByRole('button', { name: 'Flip card' }).click();
      await boton(page, 'Good').click();
      await expect(page.getByText(`Card ${n} of ${total}`)).toBeVisible();
    }

    // Al final del bloque vuelve la que se marcó "Repetir", con la marca "Again".
    await expect(palabraActual(page)).toHaveText(repetida);
    await expect(frente(page).getByText('Again', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Flip card' }).click();
    await boton(page, 'Good').click();
    await page.getByRole('button', { name: 'End review session' }).click();

    await expect(page.getByRole('heading', { name: 'Session completed' })).toBeVisible();
    await expect(page.getByText(new RegExp(`^You reviewed ${total} cards in `))).toBeVisible();
    const resumen = page.getByRole('list', { name: `${total + 1} ratings recorded` });
    await expect(resumen.getByRole('listitem').filter({ hasText: 'Repeat' })).toContainText('1');
    await expect(resumen.getByRole('listitem').filter({ hasText: 'Good' })).toContainText(String(total));
  });
});

test.describe('HU-4.2 — Sugerir familias de palabras', () => {
  // Error conocido del back: WordnetCacheRepository lee las columnas `categoria_gramatical` y
  // `familia` de wordnet_cache, pero init.sql no las crea. Toda consulta responde 500
  // ("column categoria_gramatical does not exist"). Cuando se corrija, quitar los test.fail.

  test('CA-4.2.1 Al girar la tarjeta se ven palabras relacionadas de WordNet', async ({ page, context }) => {
    test.fail(true, 'wordnet_cache de init.sql no tiene categoria_gramatical ni familia (500)');
    await abrirEstudio(page, context, 'maria');
    await page.getByRole('button', { name: 'Flip card' }).click();

    const sugerencias = dorso(page).getByRole('region', { name: 'Explore related words' });
    await expect(sugerencias).toBeVisible();
    await expect(sugerencias.locator('.sugerencias-palabras__etiqueta').first()).toBeVisible();
    await expect(sugerencias.getByRole('alert')).toHaveCount(0);
  });

  test('CA-4.2.2 La segunda consulta de una palabra se entrega desde wordnet_cache', async () => {
    test.fail(true, 'wordnet_cache de init.sql no tiene categoria_gramatical ni familia (500)');
    await api('GET', '/enrichment/family/thread', 'maria');
    const segunda = await api('GET', '/enrichment/family/thread', 'juan'); // cualquier usuario
    expect(segunda).toMatchObject({ encontrado: true, desde_cache: true });
  });

  test('CA-4.2.3 Una palabra que WordNet no conoce ofrece registrarla', async () => {
    test.fail(true, 'wordnet_cache de init.sql no tiene categoria_gramatical ni familia (500)');
    const respuesta = await api('GET', '/enrichment/family/zzqxwv', 'maria');
    expect(respuesta).toMatchObject({ encontrado: false, accion: { tipo: 'registrar_palabra' } });
  });
});
