// HE-01 — Gestión Curricular de Mazos y Vocabulario (HU-1.1, HU-1.2, HU-1.3), desde el navegador

import { test, expect } from '@playwright/test';
import { iniciarSesion } from './soporte/sesion.js';

test.describe('HU-1.1 — Crear mazos precargados por semana', () => {
  test.beforeEach(async ({ page, context }) => {
    await iniciarSesion(context, 'ana');
    await page.goto('/docente/mazos');
  });

  test('CA-1.1.1 La docente crea un mazo y aparece en la lista como abierto', async ({ page }) => {
    await page.getByRole('button', { name: '+ Crear Mazo de Estudio' }).click();
    const modal = page.getByRole('dialog', { name: 'Crear nuevo mazo de estudio' });

    await modal.locator('#semana').selectOption('16');
    await modal.locator('#curso_id').selectOption({ label: 'Literatura Anglófona' });
    await modal.locator('#nombre_lectura').fill('Things Fall Apart (E2E)');
    await modal.locator('#autor').fill('Chinua Achebe');
    await modal.locator('#fecha_apertura').fill('2026-11-20');
    await modal.locator('#fecha_cierre').fill('2026-11-27');
    await modal.getByLabel('Nigeriano').check();
    await modal.getByRole('button', { name: 'Crear mazo' }).click();

    // Al crearse con éxito el modal se cierra y la lista se actualiza
    await expect(modal).toBeHidden();
    await page.reload();
    const tarjeta = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Things Fall Apart (E2E)' }) });
    await expect(tarjeta).toContainText('Semana 16');
    await expect(tarjeta).toContainText('Mazo abierto para aportes');
  });

  test('CA-1.1.2 Sin los campos obligatorios no se crea el mazo y se muestra la validación', async ({ page }) => {
    await page.getByRole('button', { name: '+ Crear Mazo de Estudio' }).click();
    const modal = page.getByRole('dialog', { name: 'Crear nuevo mazo de estudio' });
    await modal.getByRole('button', { name: 'Crear mazo' }).click();
    await expect(modal.getByRole('alert')).toContainText('Completa todos los campos obligatorios');
  });

  test('CA-1.1.3 + CA-1.2.3 Al cerrar un mazo queda "cerrado" y deja de ofrecerse a los estudiantes', async ({ page, browser }) => {
    await page.getByRole('button', { name: 'Cerrar el mazo The Composition' }).click();
    const tarjeta = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'The Composition' }) });
    await expect(tarjeta).toContainText('Mazo cerrado');
    await expect(page.getByRole('button', { name: 'Abrir el mazo The Composition' })).toBeVisible();

    // Del lado del estudiante, el mazo cerrado ya no se puede elegir al registrar una palabra
    const contextoEstudiante = await browser.newContext();
    await iniciarSesion(contextoEstudiante, 'juan');
    const estudiante = await contextoEstudiante.newPage();
    await estudiante.goto('/estudiante');
    await estudiante.getByRole('button', { name: 'Registrar palabra' }).click();
    const opciones = estudiante.locator('#mazo_id option');
    await expect(opciones.filter({ hasText: 'Fear of Stones' })).toHaveCount(1);
    await expect(opciones.filter({ hasText: 'The Composition' })).toHaveCount(0);
    await contextoEstudiante.close();
  });
});

test.describe('HU-1.2 / HU-1.3 — Registrar palabra y detectar duplicados', () => {
  test.beforeEach(async ({ page, context }) => {
    await iniciarSesion(context, 'juan');
    await page.goto('/estudiante');
    await page.getByRole('button', { name: 'Registrar palabra' }).click();
  });

  async function llenar(page, datos) {
    const modal = page.getByRole('dialog', { name: 'Añadir nueva palabra al mazo' });
    if (datos.palabra !== undefined) await modal.locator('#palabra').fill(datos.palabra);
    if (datos.traduccion !== undefined) await modal.locator('#traduccion').fill(datos.traduccion);
    if (datos.definicion !== undefined) await modal.locator('#definicion').fill(datos.definicion);
    if (datos.ejemplo !== undefined) await modal.locator('#ejemplo').fill(datos.ejemplo);
    const valor = await modal.locator('#mazo_id option', { hasText: 'Fear of Stones' }).getAttribute('value');
    await modal.locator('#mazo_id').selectOption(valor);
    await modal.locator('button[type="submit"]').click();
    return modal;
  }

  test('CA-1.2.1 El estudiante registra una palabra nueva y queda enviada a revisión', async ({ page }) => {
    const modal = await llenar(page, {
      palabra: 'riverbank',
      traduccion: 'orilla',
      definicion: 'The land along the edge of a river.',
      ejemplo: 'They sat on the riverbank.',
    });
    await expect(modal.getByRole('status').filter({ hasText: 'Palabra enviada correctamente' })).toBeVisible();
  });

  test('CA-1.2.2 Si falta un campo obligatorio se indica y no se envía', async ({ page }) => {
    const modal = await llenar(page, { palabra: 'incomplete', traduccion: '', definicion: '' });
    await expect(modal.getByRole('alert')).toContainText('Completa los campos obligatorios');
  });

  test('CA-1.3.4 + CA-1.3.1 + CA-1.3.3 Duplicado exacto (sin importar mayúsculas): avisa antes de enviar y registra la coautoría', async ({ page }) => {
    // "stone" ya existe en "Fear of Stones" (seed) con esta definición y este ejemplo
    const modal = await llenar(page, {
      palabra: 'Stone',
      traduccion: 'piedra',
      definicion: 'A small piece of rock.',
      ejemplo: 'The boy kept a smooth stone in his pocket.',
    });
    await expect(modal.getByRole('alert')).toContainText('ya existe en el mazo, con la misma definición');
    await modal.getByRole('button', { name: 'Confirmar y enviar' }).click();
    await expect(modal.getByRole('status').filter({ hasText: 'Se te registró como coautor' })).toBeVisible();
  });

  test('CA-1.3.4 + CA-1.3.2 Duplicado parcial: avisa y guarda una acepción adicional', async ({ page }) => {
    const modal = await llenar(page, {
      palabra: 'fear',
      traduccion: 'temor',
      definicion: 'To be worried that something bad will happen.',
    });
    await expect(modal.getByRole('alert')).toContainText('con una definición distinta');
    await modal.getByRole('button', { name: 'Confirmar y enviar' }).click();
    await expect(modal.getByRole('status').filter({ hasText: 'Acepción adicional registrada' })).toBeVisible();
  });
});
