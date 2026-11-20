// HU-5.4 / HU-023 — Matriz de control de acceso por rol (RBAC) en el navegador
//
// Cada rol abre la página de inicio de todos los roles, la raíz y el login. Si la ruta es suya, se
// queda; si no, termina en SU propia vista (o en /login sin sesión), y la URL deja de cambiar: no
// hay bucles de redirección (CA-23.3). Con sesión, / y /login también llevan a su vista. También
// se comprueba que cada rol vea solo su menú.

import { test, expect } from '@playwright/test';
import { iniciarSesion } from './soporte/sesion.js';

const ROLES = [
  { rol: 'sin sesión', usuario: null, inicio: '/login' },
  { rol: 'estudiante', usuario: 'juan', inicio: '/estudiante/mazos' },
  { rol: 'docente', usuario: 'ana', inicio: '/docente/mazos' },
  { rol: 'administrador', usuario: 'admin', inicio: '/admin/usuarios' },
];

const RUTAS = ['/', '/login', '/estudiante/mazos', '/docente/mazos', '/admin/usuarios'];

/** Opción del menú lateral que identifica a cada rol. */
const MENU = {
  estudiante: 'Study Mode',
  docente: 'Word Review',
  administrador: 'Users & Roles',
};

/** Termina en `ruta` exacta (sin importar el dominio). */
const urlDe = (ruta) => new RegExp(`${ruta.replaceAll('/', '\\/')}$`);

/** Espera a que la URL deje de cambiar: si hubiera un bucle de redirección, seguiría cambiando. */
async function esperarUrlEstable(page) {
  const antes = page.url();
  await page.waitForTimeout(1000);
  expect(page.url()).toBe(antes);
}

for (const { rol, usuario, inicio } of ROLES) {
  test.describe(`Matriz de roles — ${rol}`, () => {
    test.beforeEach(async ({ context }) => {
      if (usuario) await iniciarSesion(context, usuario);
    });

    for (const ruta of RUTAS) {
      // CA-23.3 cubre la ruta del administrador y al administrador; CA-5.4.2 el resto.
      const ca = ruta.startsWith('/admin') || rol === 'administrador' ? 'CA-23.3' : 'CA-5.4.2';

      test(`${ca} ${rol} que abre ${ruta} termina en ${inicio}`, async ({ page }) => {
        await page.goto(ruta);
        await expect(page).toHaveURL(urlDe(inicio));
        await esperarUrlEstable(page);
      });
    }

    if (usuario) {
      const ca = rol === 'administrador' ? 'CA-23.3' : 'CA-5.4.2';

      test(`${ca} ${rol} solo ve las opciones de su rol en el menú`, async ({ page }) => {
        await page.goto(inicio);
        const menu = page.getByRole('complementary');

        await expect(menu.getByRole('link', { name: MENU[rol] })).toBeVisible();
        for (const [otroRol, opcion] of Object.entries(MENU)) {
          if (otroRol !== rol) await expect(menu.getByRole('link', { name: opcion })).toHaveCount(0);
        }
        if (rol === 'administrador') {
          // Sin funciones de docente ni de estudiante (CA-23.3).
          await expect(menu.getByRole('link', { name: 'Study Decks' })).toHaveCount(0);
          await expect(menu.getByRole('button', { name: '+ Create Study Deck' })).toHaveCount(0);
          await expect(menu.getByRole('button', { name: '+ Add Word to Deck' })).toHaveCount(0);
        }
      });
    }
  });
}
