// HE-02 — Supervisión y Curaduría Pedagógica Docente (HU-2.1, HU-2.2, HU-2.3), desde el navegador

import { test, expect } from '@playwright/test';
import { iniciarSesion, api } from './soporte/sesion.js';

test.describe('HU-2.1 / HU-2.2 — Revisar, aprobar y etiquetar tarjetas', () => {
  test.beforeEach(async ({ page, context }) => {
    await iniciarSesion(context, 'ana');
    await page.goto('/docente/revision-palabras');
  });

  // El contenedor más pequeño que tiene a la vez el título de la palabra y su botón "Aprobar"
  const tarjetaDe = (page, palabra) =>
    page
      .locator('div')
      .filter({ has: page.getByRole('heading', { name: palabra, exact: true }) })
      .filter({ has: page.getByRole('button', { name: 'Aprobar' }) })
      .last();

  async function aprobar(page, palabra, { registro, variante }) {
    await tarjetaDe(page, palabra).getByRole('button', { name: 'Aprobar' }).click();
    const modal = page.getByRole('dialog', { name: `Contexto de ${palabra}` });
    await modal.getByLabel(registro, { exact: true }).check();
    await modal.locator('#variante-regional').selectOption(variante);
    await modal.locator('.btn-primary').click();
    return modal;
  }

  test('CA-2.1.1 La pestaña "Nuevos Términos" lista solo las tarjetas pendientes de revisión', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /Nuevos Términos/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: 'gossip', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'secret', exact: true })).toBeVisible();
    // "stone" ya está aprobada en el seed: no debe aparecer aquí
    await expect(page.getByRole('heading', { name: 'stone', exact: true })).toHaveCount(0);
  });

  test('CA-2.1.2 + CA-2.2.1 Aprobar con registro y variante la saca de pendientes y la pasa al historial', async ({ page }) => {
    const modal = await aprobar(page, 'secret', { registro: 'Formal', variante: 'Jamaicano' });
    await expect(modal).toBeHidden();
    await expect(page.getByRole('alert')).toContainText('Tarjeta aprobada con su contexto lingüístico');
    await expect(page.getByRole('heading', { name: 'secret', exact: true })).toHaveCount(0);

    await page.getByRole('tab', { name: /Historial Aprobadas/ }).click();
    await expect(page.getByText('secret', { exact: true })).toBeVisible();
  });

  test('CA-2.2.1 Variante "Ghanés": se aprueba con su contexto como las demás variantes', async ({ page }) => {
    test.fail(true, 'ERROR CONOCIDO: el modal ofrece "Ghanés" y el backend (ContextoService.VARIANTES_PERMITIDAS) solo acepta "inglés ghanés" → 400. Como el front aprueba ANTES de guardar el contexto (RevisionPalabras.jsx), la tarjeta queda aprobada sin registro ni variante y el modal no se cierra.');
    const modal = await aprobar(page, 'gossip', { registro: 'Informal', variante: 'Ghanés' });
    await expect(modal).toBeHidden({ timeout: 5000 });
  });

  test('CA-2.2.x Para aprobar es obligatorio elegir registro y variante', async ({ page }) => {
    await page.getByRole('button', { name: 'Aprobar' }).first().click();
    const modal = page.getByRole('dialog');
    await modal.locator('.btn-primary').click();
    await expect(modal.getByRole('alert')).toContainText('Selecciona un registro y una variante regional');
  });

  // El rechazo no existe en el backend ni en el front (ver CLAUDE.md del backend).
  test.fixme('CA-2.1.3 Rechazar con observación y notificar al estudiante — NO IMPLEMENTADO', async () => {});
});

test.describe('HU-2.3 — Visualizar resumen de participación', () => {
  test.beforeAll(async () => {
    // Juan aporta en "Where Are You From?" (sin aportes en el seed); María y Carlos no.
    const mazos = await api('GET', '/decks', 'ana');
    const mazo = mazos.find((m) => m.nombre_lectura === 'Where Are You From?');
    await api('POST', `/decks/${mazo.id_mazo}/cards`, 'juan', {
      palabra: 'homeland',
      traduccion: 'patria',
      definicion: 'The country where you were born.',
    });
  });

  test.beforeEach(async ({ page, context }) => {
    await iniciarSesion(context, 'ana');
    await page.goto('/docente/participacion');
    await page.getByLabel('Mazo').selectOption({ label: 'Semana 12 · Where Are You From?' });
  });

  const filaDe = (page, nombre) => page.getByRole('row').filter({ hasText: nombre });

  test('CA-2.3.1 Tabla por mazo con palabras aportadas, coautorías y estado de revisión', async ({ page }) => {
    for (const columna of ['Estudiante', 'Palabras aportadas', 'Coautorías', 'Pendientes', 'Aprobadas']) {
      await expect(page.getByRole('columnheader', { name: columna })).toBeVisible();
    }
    // Juan: 1 palabra, 0 coautorías, 1 pendiente, 0 aprobadas
    await expect(filaDe(page, 'Juan Estudiante').getByRole('cell')).toHaveText([/Juan Estudiante/, '1', '0', '1', '0', /.*/]);
  });

  test('CA-2.3.2 "Solo sin aportes" resalta a los estudiantes que no han participado', async ({ page }) => {
    await page.getByLabel('Solo sin aportes').check();
    await expect(filaDe(page, 'Maria Estudiante')).toBeVisible();
    await expect(filaDe(page, 'Carlos Estudiante')).toBeVisible();
    await expect(filaDe(page, 'Juan Estudiante')).toHaveCount(0);
  });

  test('CA-2.3.3 Un aporte nuevo se refleja al actualizar el panel', async ({ page }) => {
    const fila = filaDe(page, 'Maria Estudiante');
    await expect(fila.getByRole('cell').nth(1)).toHaveText('0');

    const mazos = await api('GET', '/decks', 'ana');
    const mazo = mazos.find((m) => m.nombre_lectura === 'Where Are You From?');
    await api('POST', `/decks/${mazo.id_mazo}/cards`, 'maria', {
      palabra: 'roots',
      traduccion: 'raíces',
      definicion: 'The origins of a person or family.',
    });

    await page.getByRole('button', { name: 'Actualizar ahora' }).click();
    await expect(fila.getByRole('cell').nth(1)).toHaveText('1');
  });
});
