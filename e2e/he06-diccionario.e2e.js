// HE-06 — Consulta centralizada de vocabulario y mazos (HU-016, HU-017), con sesión de estudiante
// y como invitado (sin sesión)
//
// Las mismas pruebas corren para los dos roles con un `for`. Antes de empezar, Juan registra una
// palabra que queda pendiente de revisión: ni el diccionario ni las palabras del mazo deben
// mostrarla (solo se publica lo aprobado por la docente, estado revisado_docente).

import { test, expect } from '@playwright/test';
import { api, iniciarSesion } from './soporte/sesion.js';

const ROLES = [
  { rol: 'estudiante', usuario: 'juan', base: '/estudiante' },
  { rol: 'invitado', usuario: null, base: '/invitado' },
];

/** Palabras aprobadas de seed.sql, en el mazo "Stitch by Stitch" (semana 1). */
const MAZO = 'Stitch by Stitch';
const MEND = { palabra: 'mend', traduccion: 'remendar' };
const THIMBLE = { palabra: 'thimble', traduccion: 'dedal' };

/** Palabra pendiente de revisión, única en cada ejecución. */
const PENDIENTE = `pendientehe${Date.now()}`;

/** Tarjeta del diccionario: un <article> con la palabra como encabezado. */
const tarjetaDe = (page, palabra) =>
  page.getByRole('region', { name: 'Approved vocabulary' }).getByRole('article').filter({
    has: page.getByRole('heading', { name: palabra, exact: true }),
  });

async function buscar(page, texto) {
  await page.getByRole('searchbox', { name: 'Search vocabulary' }).fill(texto);
  await page.getByRole('search').getByRole('button', { name: 'Search' }).click();
}

test.beforeAll(async () => {
  const mazos = await api('GET', '/decks', 'juan');
  const abierto = mazos.find((m) => m.estado === 'abierto');
  await api('POST', `/decks/${abierto.id_mazo}/cards`, 'juan', {
    palabra: PENDIENTE,
    traduccion: 'pendiente',
    definicion: 'A word that the teacher has not reviewed yet.',
  });
});

for (const { rol, usuario, base } of ROLES) {
  test.describe(`HE-06 — ${rol}`, () => {
    test.beforeEach(async ({ context }) => {
      if (usuario) await iniciarSesion(context, usuario);
    });

    test(`CA-16.1 ${rol}: el diccionario global muestra solo las palabras aprobadas`, async ({ page }) => {
      const { data: aprobadas } = await api('GET', '/dictionary', null);
      await page.goto(`${base}/diccionario`);

      await expect(page.getByRole('heading', { level: 1, name: 'Global Dictionary' })).toBeVisible();
      await expect(page.getByText(`${aprobadas.length} words found`)).toBeVisible();
      await expect(tarjetaDe(page, MEND.palabra)).toContainText(MEND.traduccion);
      await expect(tarjetaDe(page, PENDIENTE)).toHaveCount(0);

      // Detalle de la palabra: definición y ejemplo.
      await tarjetaDe(page, MEND.palabra).getByRole('button', { name: /View Details/ }).click();
      const detalle = page.getByRole('dialog');
      await expect(detalle.getByRole('heading', { name: 'Definition' })).toBeVisible();
      await expect(detalle.getByRole('heading', { name: 'Example' })).toBeVisible();
      await detalle.getByRole('button', { name: 'Close word details' }).click();
      await expect(detalle).toHaveCount(0);
    });

    test(`CA-16.2 ${rol}: busca por parte de la palabra sin distinguir mayúsculas y filtra por letra`, async ({ page }) => {
      await page.goto(`${base}/diccionario`);
      await expect(tarjetaDe(page, MEND.palabra)).toBeVisible();

      await buscar(page, 'MEN');
      await expect(tarjetaDe(page, MEND.palabra)).toBeVisible();
      await expect(tarjetaDe(page, THIMBLE.palabra)).toHaveCount(0);

      await page.getByRole('button', { name: 'Clear Filters' }).click();
      await page.getByRole('navigation', { name: 'Filter vocabulary by first letter' })
        .getByRole('button', { name: 'T', exact: true }).click();
      await expect(tarjetaDe(page, THIMBLE.palabra)).toBeVisible();
      await expect(tarjetaDe(page, MEND.palabra)).toHaveCount(0);
    });

    test(`CA-16.3 ${rol}: si no hay coincidencias lo informa, sin error`, async ({ page }) => {
      await page.goto(`${base}/diccionario`);
      await buscar(page, 'zzqxwv');

      await expect(page.getByRole('heading', { name: 'No matching words found' })).toBeVisible();
      await expect(page.getByText('No approved vocabulary matches "zzqxwv". Try another search.')).toBeVisible();
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test(`CA-17.1 ${rol}: ve los mazos disponibles con su información`, async ({ page }) => {
      const mazos = await api('GET', '/decks', usuario);
      await page.goto(`${base}/mazos`);

      await expect(page.getByRole('heading', { level: 3 })).toHaveCount(mazos.length);
      const tarjeta = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: MAZO }) });
      await expect(tarjeta).toContainText('Week 1');
      await expect(tarjeta).toContainText('Deck closed');
    });

    test(`CA-17.3 ${rol}: al elegir un mazo ve solo sus palabras aprobadas`, async ({ page }) => {
      await page.goto(`${base}/mazos`);
      await page.getByRole('link', { name: `View the words of deck ${MAZO}` }).click();

      await expect(page).toHaveURL(new RegExp(`${base}/mazos/\\d+/palabras$`));
      await expect(page.getByRole('heading', { level: 1, name: 'Deck Words' })).toBeVisible();
      await expect(page.getByText(`Approved vocabulary from the deck "${MAZO}".`)).toBeVisible();
      await expect(tarjetaDe(page, MEND.palabra)).toBeVisible();
      await expect(tarjetaDe(page, THIMBLE.palabra)).toBeVisible();
      // Palabras de otros mazos no aparecen.
      await expect(page.getByText('WEEK 1', { exact: true })).toHaveCount(await page.getByRole('article').count());
    });

    test(`CA-17.3 ${rol}: la palabra pendiente de revisión no aparece en su mazo`, async ({ page }) => {
      const mazos = await api('GET', '/decks', 'juan');
      const abierto = mazos.find((m) => m.estado === 'abierto');
      await page.goto(`${base}/mazos/${abierto.id_mazo}/palabras`);

      await expect(page.getByRole('heading', { level: 1, name: 'Deck Words' })).toBeVisible();
      await expect(page.getByRole('status').or(page.getByRole('region', { name: 'Approved vocabulary' }))).toBeVisible();
      await expect(tarjetaDe(page, PENDIENTE)).toHaveCount(0);
      await expect(page.getByText(PENDIENTE)).toHaveCount(0);
    });
  });
}

test('CA-17.2 Un estudiante sin curso ve un aviso de que no hay mazos, sin error', async ({ page, context }) => {
  // Thalía nunca se inscribe en ninguna prueba (Manuela y Karen sí, en he05-perfil-inscripcion).
  await iniciarSesion(context, 'thalia');
  await page.goto('/estudiante/mazos');

  await expect(page.getByText("You don't have any decks available yet. Join a course to see them.")).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});
