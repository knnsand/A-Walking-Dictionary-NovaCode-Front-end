// HU-5.2 (perfil académico) y HU-5.3 (inscripción a cursos), desde el navegador

import { test, expect } from '@playwright/test';
import { iniciarSesion, USUARIOS } from './soporte/sesion.js';

test.describe('HU-5.2 — Configurar perfil académico', () => {
  test.beforeEach(async ({ page, context }) => {
    await iniciarSesion(context, 'carlos'); // perfil incompleto (sin código estudiantil)
    await page.goto('/estudiante/configuracion-perfil');
  });

  test('CA-5.2.1 + CA-5.2.2 Guarda nivel MCER, código, avatar e intereses y los conserva', async ({ page }) => {
    await page.getByRole('radio', { name: /^C1/ }).check();
    await page.getByLabel('Código estudiantil').fill('104600004');
    await page.getByLabel('URL del avatar').fill('https://ejemplo.com/avatar-carlos.png');
    await page.getByLabel('Intereses').fill('poesía, teatro');
    await page.getByRole('button', { name: 'Guardar Cambios' }).click();
    await expect(page.getByRole('alert')).toContainText('Perfil actualizado correctamente.');

    await page.reload();
    await expect(page.getByRole('radio', { name: /^C1/ })).toBeChecked();
    await expect(page.getByLabel('Código estudiantil')).toHaveValue('104600004');
    await expect(page.getByLabel('Intereses')).toHaveValue(/poesía/);
  });

  test('CA-5.2.1 Muestra los datos de la cuenta y el contexto académico', async ({ page }) => {
    await expect(page.locator('p', { hasText: 'Correo institucional:' })).toContainText('carlos.estudiante@unicauca.edu.co');
    await expect(page.locator('p', { hasText: 'Curso asignado:' })).toContainText('Literatura Anglófona');
  });
});

test.describe('HU-5.3 — Inscribir o asignar a cursos', () => {
  test('CA-5.3.1 La docente genera el código y el estudiante se une con él', async ({ page, context, browser }) => {
    await iniciarSesion(context, 'ana');
    await page.goto('/docente/cursos');
    await page.getByRole('button', { name: 'Generar código' }).click();
    const tarjetaCurso = page.getByRole('link', { name: /Literatura Anglófona/ });
    await expect(tarjetaCurso).not.toContainText('Sin código');
    const codigo = (await tarjetaCurso.textContent()).match(/[A-Z0-9]{8}/)[0];

    const contextoEstudiante = await browser.newContext();
    await iniciarSesion(contextoEstudiante, 'karen');
    const estudiante = await contextoEstudiante.newPage();
    await estudiante.goto('/estudiante');
    await estudiante.locator('button.btn', { hasText: 'Unirme a un curso' }).click();
    await estudiante.getByLabel('Código de acceso').fill(codigo.toLowerCase());
    await estudiante.locator('form button[type="submit"]').click();
    await expect(estudiante.getByRole('alert')).toContainText('Te uniste al curso correctamente.');

    // CA-5.3.1 "vincula al grupo": ahora ve los mazos del curso
    await estudiante.goto('/estudiante/mazos');
    await expect(estudiante.getByRole('heading', { name: 'Fear of Stones and Other Stories' })).toBeVisible();
    await contextoEstudiante.close();
  });

  test('CA-5.3.1 Un código inválido muestra el error', async ({ page, context }) => {
    await iniciarSesion(context, 'manuela');
    await page.goto('/estudiante');
    await page.locator('button.btn', { hasText: 'Unirme a un curso' }).click();
    await page.getByLabel('Código de acceso').fill('ZZZZZZZZ');
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByRole('alert')).toContainText('Código de acceso inválido');
  });

  test('CA-5.3.2 La docente inscribe directamente a un estudiante por correo', async ({ page, context }) => {
    await iniciarSesion(context, 'ana');
    await page.goto('/docente/cursos');
    await page.getByRole('button', { name: 'Agregar estudiante al curso' }).click();
    const formulario = page.locator('form').filter({ has: page.getByRole('heading', { name: 'Inscribir estudiante' }) });
    await formulario.getByLabel('Curso').selectOption({ label: 'Literatura Anglófona' });
    await formulario.getByLabel('Correo del estudiante').fill(USUARIOS.manuela.email);
    await formulario.locator('button[type="submit"]').click();
    await expect(formulario.getByRole('alert')).toContainText('quedó inscrito correctamente');
  });
});
