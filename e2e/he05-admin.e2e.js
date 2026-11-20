// HU-023 — Administrar usuarios y roles (vista del administrador en el navegador)
//
// El administrador es William Serna (ver preparacion-global.js). Los cambios de rol y estado se
// hacen sobre thaliabernal, que ninguna otra prueba usa, y se revierten por la API al terminar
// cada prueba para no afectar a las siguientes (todas comparten la base).

import { test, expect } from '@playwright/test';
import { api, iniciarSesion, USUARIOS } from './soporte/sesion.js';

/** Fila de la tabla de usuarios que contiene el correo dado. */
const filaDe = (page, email) => page.getByRole('row').filter({ hasText: email });

/** Escribe en el buscador y busca. */
async function buscar(page, texto) {
  await page.getByLabel('Search').fill(texto);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
}

test.describe('HU-023 — Administrar usuarios y roles', () => {
  test.beforeEach(async ({ page, context }) => {
    await iniciarSesion(context, 'admin');
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/usuarios$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Users & Roles' })).toBeVisible();
  });

  test.afterEach(async () => {
    // Deja a Thalía como estaba en el seed (estudiante activa).
    await api('PATCH', `/admin/users/${USUARIOS.thalia.id_usuario}/role`, 'admin', { rol: 'estudiante' });
    await api('PATCH', `/admin/users/${USUARIOS.thalia.id_usuario}/status`, 'admin', { activo: true });
  });

  test('CA-23.1 Lista los usuarios con nombre, correo, rol, estado y fecha de registro', async ({ page }) => {
    const fila = filaDe(page, USUARIOS.juan.email);
    await expect(fila).toContainText('Juan Estudiante');
    await expect(fila.getByRole('combobox')).toHaveValue('estudiante');
    await expect(fila).toContainText('Active');
    await expect(fila.getByRole('cell').nth(4)).toHaveText(/\d/);
    await expect(page.getByText(/^\d+ users$/)).toBeVisible();
    await expect(page.getByText('hash_temporal')).toHaveCount(0);
  });

  test('CA-23.1 Busca por correo y filtra por rol y por estado', async ({ page }) => {
    await buscar(page, 'maria.estudiante');
    await expect(page.getByRole('row')).toHaveCount(2); // encabezado + María
    await expect(filaDe(page, USUARIOS.maria.email)).toBeVisible();

    await page.getByRole('button', { name: 'Clear filters' }).click();
    await page.getByRole('combobox', { name: 'Role', exact: true }).selectOption('docente');
    await expect(filaDe(page, USUARIOS.ana.email)).toBeVisible();
    await expect(filaDe(page, USUARIOS.juan.email)).toHaveCount(0);

    await page.getByRole('combobox', { name: 'Role', exact: true }).selectOption('');
    await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('false');
    await expect(page.getByText('No users match the current filters.')).toBeVisible();
  });

  test('CA-23.2 Cambia el rol de una cuenta después de confirmar y el cambio se guarda', async ({ page }) => {
    const fila = filaDe(page, USUARIOS.thalia.email);
    page.once('dialog', (dialogo) => dialogo.accept());
    await fila.getByRole('combobox').selectOption('docente');
    await expect(page.getByRole('status')).toContainText('thaliabernal is now Teacher.');

    await page.reload();
    await expect(filaDe(page, USUARIOS.thalia.email).getByRole('combobox')).toHaveValue('docente');
  });

  test('CA-23.2 Si el administrador cancela la confirmación, no cambia nada', async ({ page }) => {
    const fila = filaDe(page, USUARIOS.thalia.email);
    page.once('dialog', (dialogo) => dialogo.dismiss());
    await fila.getByRole('combobox').selectOption('docente');
    await expect(fila.getByRole('combobox')).toHaveValue('estudiante');

    await page.reload();
    await expect(filaDe(page, USUARIOS.thalia.email).getByRole('combobox')).toHaveValue('estudiante');
  });

  test('CA-23.2 Desactiva una cuenta, aparece entre las inactivas y se puede reactivar', async ({ page }) => {
    page.once('dialog', (dialogo) => dialogo.accept());
    await filaDe(page, USUARIOS.thalia.email).getByRole('button', { name: 'Deactivate' }).click();
    await expect(page.getByRole('status')).toContainText('The account of thaliabernal was deactivated.');
    await expect(filaDe(page, USUARIOS.thalia.email)).toContainText('Inactive');

    await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('false');
    await expect(filaDe(page, USUARIOS.thalia.email)).toBeVisible();

    page.once('dialog', (dialogo) => dialogo.accept());
    await filaDe(page, USUARIOS.thalia.email).getByRole('button', { name: 'Activate' }).click();
    await expect(page.getByRole('status')).toContainText('The account of thaliabernal was activated.');
  });

  test('CA-23.2 Una cuenta desactivada ya no puede usar la aplicación, aunque tenga la sesión abierta', async ({ page, browser }) => {
    // Error conocido del back: el middleware `authenticate` solo valida la firma del JWT y no
    // revisa `usuario.activo`, así que el token de la cuenta desactivada sigue sirviendo hasta que
    // vence (8 h). Es la limitación de HU-023 anotada en el CLAUDE.md del back. Al corregirla, quitar el test.fail.
    test.fail(true, 'authenticate no revisa usuario.activo: el JWT sigue vigente tras desactivar');

    // Thalía tiene la sesión abierta en su propio navegador (otro contexto, otro localStorage).
    const contextoThalia = await browser.newContext();
    await iniciarSesion(contextoThalia, 'thalia');
    const thalia = await contextoThalia.newPage();
    await thalia.goto('/estudiante');
    await expect(thalia).toHaveURL(/\/estudiante/);
    const rutaPropia = `/students/${USUARIOS.thalia.id_usuario}/context`;
    await api('GET', rutaPropia, 'thalia'); // antes de desactivarla, su token sirve

    // El administrador la desactiva desde la interfaz.
    page.once('dialog', (dialogo) => dialogo.accept());
    await filaDe(page, USUARIOS.thalia.email).getByRole('button', { name: 'Deactivate' }).click();
    await expect(page.getByRole('status')).toContainText('The account of thaliabernal was deactivated.');

    // Con el mismo token, la API ya no la deja entrar.
    await expect(api('GET', rutaPropia, 'thalia')).rejects.toThrow(/ 40[13] /);
    await contextoThalia.close();
  });

  test('CA-23.4 No deja quitar el rol a un docente con cursos y muestra el error traducido', async ({ page }) => {
    const fila = filaDe(page, USUARIOS.ana.email);
    page.once('dialog', (dialogo) => dialogo.accept());
    await fila.getByRole('combobox').selectOption('estudiante');

    await expect(page.getByRole('alert')).toContainText(
      'This teacher has assigned courses, so their role cannot be changed.'
    );
    await page.reload();
    await expect(filaDe(page, USUARIOS.ana.email).getByRole('combobox')).toHaveValue('docente');
  });

  test('CA-23.4 Los controles de su propia cuenta están deshabilitados', async ({ page }) => {
    const fila = filaDe(page, USUARIOS.admin.email);
    await expect(fila).toContainText('(you)');
    await expect(fila.getByRole('combobox')).toBeDisabled();
    await expect(fila.getByRole('button', { name: 'Deactivate' })).toBeDisabled();
  });

  test('CA-23.4 Aunque se salte la interfaz, la API rechaza cambiar la propia cuenta', async () => {
    await expect(
      api('PATCH', `/admin/users/${USUARIOS.admin.id_usuario}/role`, 'admin', { rol: 'docente' })
    ).rejects.toThrow(/409.*ADMIN_SELF_CHANGE/);
    await expect(
      api('PATCH', `/admin/users/${USUARIOS.admin.id_usuario}/role`, 'admin', { rol: 'invitado' })
    ).rejects.toThrow(/400.*ADMIN_INVALID_ROLE/);
  });
});
