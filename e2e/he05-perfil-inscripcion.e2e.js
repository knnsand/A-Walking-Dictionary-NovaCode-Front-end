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
    await page.getByLabel('Student code').fill('104600004');
    await page.getByLabel('Avatar URL').fill('https://ejemplo.com/avatar-carlos.png');
    await page.getByLabel('Interests').fill('poesía, teatro');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByRole('alert')).toContainText('Profile updated successfully.');

    await page.reload();
    await expect(page.getByRole('radio', { name: /^C1/ })).toBeChecked();
    await expect(page.getByLabel('Student code')).toHaveValue('104600004');
    await expect(page.getByLabel('Interests')).toHaveValue(/poesía/);
  });

  test('CA-5.2.1 Muestra los datos de la cuenta y el contexto académico', async ({ page }) => {
    await expect(page.locator('p', { hasText: 'Institutional email:' })).toContainText('carlos.estudiante@unicauca.edu.co');
    await expect(page.locator('p', { hasText: 'Assigned course:' })).toContainText('Literatura Anglófona');
  });
});

test.describe('HU-5.3 — Inscribir o asignar a cursos', () => {
  test('CA-5.3.1 La docente genera el código y el estudiante se une con él', async ({ page, context, browser }) => {
    await iniciarSesion(context, 'ana');
    await page.goto('/docente/cursos');
    await page.getByRole('button', { name: 'Generate code', exact: true }).click();
    const tarjetaCurso = page.getByRole('link', { name: /Literatura Anglófona/ });
    await expect(tarjetaCurso).not.toContainText('No code');
    const codigo = (await tarjetaCurso.textContent()).match(/[A-Z0-9]{8}/)[0];

    const contextoEstudiante = await browser.newContext();
    await iniciarSesion(contextoEstudiante, 'karen');
    const estudiante = await contextoEstudiante.newPage();
    await estudiante.goto('/estudiante');
    await estudiante.locator('button.btn', { hasText: 'Join a course' }).click();
    await estudiante.getByLabel('Access code').fill(codigo.toLowerCase());
    await estudiante.locator('form button[type="submit"]').click();
    await expect(estudiante.getByRole('alert')).toContainText('You joined the course successfully.');

    // CA-5.3.1 "vincula al grupo": ahora ve los mazos del curso
    await estudiante.goto('/estudiante/mazos');
    await expect(estudiante.getByRole('heading', { name: 'Fear of Stones and Other Stories' })).toBeVisible();
    await contextoEstudiante.close();
  });

  test('CA-5.3.1 Un código inválido muestra el error', async ({ page, context }) => {
    await iniciarSesion(context, 'manuela');
    await page.goto('/estudiante');
    await page.locator('button.btn', { hasText: 'Join a course' }).click();
    await page.getByLabel('Access code').fill('ZZZZZZZZ');
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByRole('alert')).toContainText('Código de acceso inválido'); // mensaje del backend: sigue en español hasta que la API envíe "code"
  });

  test('CA-5.3.2 La docente inscribe directamente a un estudiante por correo', async ({ page, context }) => {
    await iniciarSesion(context, 'ana');
    await page.goto('/docente/cursos');
    await page.getByRole('button', { name: 'Add student to the course' }).click();
    const formulario = page.locator('form').filter({ has: page.getByRole('heading', { name: 'Enroll student' }) });
    await formulario.getByLabel('Course').selectOption({ label: 'Literatura Anglófona' });
    await formulario.getByLabel('Student email').fill(USUARIOS.manuela.email);
    await formulario.locator('button[type="submit"]').click();
    await expect(formulario.getByRole('alert')).toContainText('was enrolled successfully');
  });
});
