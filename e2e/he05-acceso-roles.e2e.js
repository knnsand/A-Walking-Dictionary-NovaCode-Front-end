// HU-5.4 — Iniciar sesión y control de roles (vista del usuario en el navegador)

import { test, expect } from '@playwright/test';
import { iniciarSesion, firmarJwt, USUARIOS } from './soporte/sesion.js';

test.describe('HU-5.4 — Iniciar sesión y control de roles', () => {
  test('CA-5.4.1 Sin sesión, el login ofrece Google, modo invitado y registro', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'A Walking Dictionary' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar como invitado' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Regístrate como estudiante' })).toBeVisible();
  });

  test('CA-5.4.1 Con sesión de docente entra al dashboard docente con su nombre', async ({ page, context }) => {
    await iniciarSesion(context, 'ana');
    await page.goto('/docente');
    await expect(page).toHaveURL(/\/docente\/mazos$/);
    await expect(page.getByRole('complementary').getByText('Ana Docente')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Revisión de Palabras' })).toBeVisible();
  });

  test('CA-5.4.1 Cerrar sesión vuelve al login y protege de nuevo las rutas', async ({ page }) => {
    // Sesión guardada UNA vez (sin addInitScript, que la repondría en cada carga).
    await page.goto('/login');
    await page.evaluate(([token, usuario]) => {
      localStorage.setItem('walking_dictionary_token', token);
      localStorage.setItem('walking_dictionary_usuario', usuario);
    }, [firmarJwt(USUARIOS.ana), JSON.stringify(USUARIOS.ana)]);

    await page.goto('/docente/mazos');
    await expect(page.getByRole('heading', { name: 'Mazos de estudio' })).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto('/docente/revision-palabras');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('CA-5.4.2 Sin sesión, una ruta de docente redirige al login', async ({ page }) => {
    await page.goto('/docente/revision-palabras');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('CA-5.4.2 Un estudiante que abre una URL de docente es redirigido a su vista', async ({ page, context }) => {
    await iniciarSesion(context, 'juan');
    await page.goto('/docente/revision-palabras');
    await expect(page).toHaveURL(/\/estudiante$/);
    await expect(page.getByRole('heading', { name: 'Mis aportes' })).toBeVisible();
  });

  test('CA-5.4.2 Una docente que abre una URL de estudiante es redirigida a su vista', async ({ page, context }) => {
    await iniciarSesion(context, 'ana');
    await page.goto('/estudiante/configuracion-perfil');
    await expect(page).toHaveURL(/\/docente\/mazos$/);
  });

  test('CA-5.4.3 Invitado: ve los mazos en solo lectura, sin acciones de edición', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Continuar como invitado' }).click();
    await expect(page).toHaveURL(/\/invitado\/mazos$/);

    await expect(page.getByRole('heading', { name: 'Fear of Stones and Other Stories' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Crear Mazo/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Cerrar el mazo/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Registrar palabra' })).toHaveCount(0);
  });
});
