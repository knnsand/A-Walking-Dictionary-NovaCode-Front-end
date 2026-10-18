# Pruebas E2E (Playwright)

Un navegador real (Chromium) usa la aplicación como lo haría la docente o un estudiante. El front llama al **backend real**, y este usa **PostgreSQL real**. Cada prueba corresponde a un criterio de aceptación (CA) del backlog.

| | Pruebas unitarias (`src/**/*.test.jsx`) | Pruebas E2E (`e2e/*.e2e.js`) |
|---|---|---|
| Qué prueban | Componentes aislados | Recorridos completos por CA, en el navegador |
| Backend | Simulado (`fetch` o API mockeada) | Backend y base de datos reales |
| Comando | `npm test` | `npm run test:e2e` |
| CI | Workflow de CI del front | `.github/workflows/e2e.yml` |

Los archivos se llaman `*.e2e.js` para que Vitest no los ejecute.

## Ejecutar en local

Con este repo clonado dentro de `walking-dictionary-infra`:

```bash
# desde la raíz de walking-dictionary-infra (necesita CORS_ORIGINS en el docker-compose.yml)
docker compose up -d

# desde la raíz de este repo, la primera vez:
npm install
npx playwright install chromium

npm run test:e2e
```

- **Las pruebas reinician la base local** al estado de `init.sql` + `seed.sql` del backend antes de empezar. Si el contenedor `walking_dictionary_db` está corriendo, el reinicio se hace dentro de él. Para no reiniciarla: `SIN_REINICIO_BD=true npm run test:e2e`.
- **Variables:** se leen del `.env` de infra (`JWT_SECRET` debe ser el mismo del backend, y `DISABLE_AUTH=false`). También se pueden pasar `FRONT_URL`, `API_URL` y `BACK_REPO`.
- **Ver el navegador:** `npx playwright test --headed`. Modo interactivo: `npx playwright test --ui`.

## Login

Google no se puede automatizar. Cada prueba firma un JWT con `JWT_SECRET` y el mismo payload que emite el backend, y lo deja en `localStorage` (`walking_dictionary_token` / `walking_dictionary_usuario`, igual que `AuthProvider.jsx`) antes de abrir la página. Ver `soporte/sesion.js`.

La preparación global completa el perfil de Juan, María, Karen y Manuela, porque con el perfil incompleto el front bloquea el menú (HU-012). Carlos queda sin completar para probar HU-5.2.

## Reporte

En `reportes-e2e/html` (abrir con `npx playwright show-report reportes-e2e/html`) y `reportes-e2e/junit.xml`. Si una prueba falla, guarda captura de pantalla y *trace* (`npx playwright show-trace <archivo>.zip`). En GitHub Actions se descarga como artefacto `reporte-pruebas-e2e`.

## Qué cubre

| Archivo | HU |
|---|---|
| `he01-mazos-vocabulario.e2e.js` | HU-1.1, 1.2, 1.3 |
| `he02-curaduria-docente.e2e.js` | HU-2.1, 2.2, 2.3 |
| `he03-evaluacion.e2e.js` | HU-3.1, 3.2, 3.3 |
| `he05-acceso-roles.e2e.js` | HU-5.4 |
| `he05-perfil-inscripcion.e2e.js` | HU-5.2, 5.3 |

### Errores conocidos (`test.fail`)

Estas pruebas describen el comportamiento correcto y hoy fallan "a propósito". Cuando se corrija el error, Playwright avisa que pasan, y hay que quitar el `test.fail`.

- **CA-2.2.1, variante "Ghanés":** el modal la ofrece, pero el backend solo acepta "inglés ghanés" y responde 400. Como el front aprueba antes de guardar el contexto, la tarjeta queda aprobada sin registro ni variante.
- **CA-3.2.3, desde otro dispositivo:** `ResponderQuiz.jsx` solo recuerda el envío en `localStorage` y no consulta `GET /quizzes/:id/result`.

### Pendientes (`test.fixme`)

- **CA-2.1.3** (rechazo): no está implementado.
- **CA-3.3.1 / 3.3.2** (exportar PDF): falta el botón en el front.
