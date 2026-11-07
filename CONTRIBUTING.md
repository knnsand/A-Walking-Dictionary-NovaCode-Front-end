# Guía de contribución — A Walking Dictionary (Front-end)

Este documento explica cómo trabajamos en el repositorio. Complementa el [README](README.md).

## 1. Flujo de ramas (Gitflow)

Se sigue un flujo tipo **Gitflow**, adaptado al ritmo de sprints del curso.

| Rama | Uso |
| --- | --- |
| `main` | Rama protegida y de producción. Solo recibe merges desde `release/*` o `hotfix/*`. Siempre debe estar en estado desplegable. |
| `develop` | Rama de integración. Aquí se juntan todas las funcionalidades ya terminadas y probadas antes de pasar a `release`. |
| `feature/nombre-corto` | Nueva funcionalidad o historia de usuario, creada desde `develop`. Ej: `feature/gestion-electivas`, `feature/conexion-back-front`. |
| `feature/area/nombre-corto` | Variante con subcarpeta cuando se quiere agrupar por módulo/área. Ej: `feature/backend/publicadores-consumidores`, `feature/frontend/panel-docente`. |
| `release/nombre-o-version` | Prepara una entrega (fin de sprint). Se crea desde `develop`, se estabiliza (ajustes finos, sin funcionalidades nuevas) y luego se mergea a `main` y de vuelta a `develop`. |
| `hotfix/nombre-corto` | Corrección urgente directo sobre `main` cuando ya hubo release y aparece un bug crítico. Se mergea a `main` y a `develop`. |
| `backup/nombre-corto` | Respaldo puntual de una rama antes de un cambio riesgoso (rebase, refactor grande). No se mergea a `develop`; se elimina cuando ya no se necesita. |

## 2. Nombres de rama

- Minúsculas, palabras separadas por guion (`-`), sin tildes ni ñ.
- El nombre describe la funcionalidad o módulo, no la persona ni la fecha. Ej: `feature/gestion-electivas`, no `feature/manuela-tarea1`.
- Cuando la rama corresponde a una historia de usuario del backlog, se puede incluir el ID: `feature/HU-002-registro-palabra`.

## 3. Paso a paso de una contribución

1. Actualizar `develop` local (`git pull origin develop`) antes de crear una rama nueva.
2. Crear la rama de trabajo desde `develop`: `git checkout -b feature/nombre-corto`.
3. Trabajar con commits pequeños y descriptivos (ver sección 4).
4. Subir la rama: `git push -u origin feature/nombre-corto`.
5. Abrir un Pull Request hacia `develop`, enlazando la historia o el hallazgo correspondiente.
6. Al menos un compañero revisa y aprueba el PR antes de hacer merge.
7. Al cierre de cada sprint: crear `release/sprintX` desde `develop`, estabilizar, hacer PR de `release/sprintX` → `main` y luego mergear `main` de vuelta a `develop`.
8. Si aparece un bug crítico en producción: crear `hotfix/nombre-corto` desde `main`, corregir, y mergear tanto a `main` como a `develop`.
9. Eliminar cada rama (`feature/*`, `release/*`, `hotfix/*`) una vez mergeada, para mantener la lista limpia.

## 4. Mensajes de commit

Formato: `tipo(alcance): descripción`, donde el alcance es opcional.

| Tipo | Cuándo |
| --- | --- |
| `feat` | Funcionalidad nueva |
| `fix` | Corrección de un error |
| `docs` | Solo documentación |
| `chore` | Mantenimiento (dependencias, configuración) |
| `test` | Pruebas |
| `ci` | Workflows de GitHub Actions |

Ejemplos del historial: `feat(i18n): migrar formulario de registro de palabra a ingles`, `ci: agregar analisis estatico con CodeQL`.

## 5. Antes de abrir el Pull Request

Desde la raíz del repositorio:

```bash
npm run lint
npm test
npm run build
```

Si el cambio toca un recorrido completo, ejecutar además las pruebas E2E (requieren backend y PostgreSQL; ver [`e2e/README.md`](e2e/README.md)):

```bash
npm run test:e2e
```

Los workflows de `.github/workflows/` (CI, E2E, SonarQube Cloud, CodeQL) deben quedar en verde.

## 6. Pull Requests

- Usar la plantilla de `.github/pull_request_template.md`: descripción, historia de usuario o hallazgo, cambios, cómo probar y checklist.
- Un PR por propósito. PR pequeños se revisan mejor.
- Marcar en el checklist solo lo que realmente se cumplió.

## 7. Documentar lo que cambias

- Si cambias lo que el front consume o espera del backend, actualiza el contrato correspondiente en `docs/contrato-*.md`.
- Los textos de la interfaz viven en `src/i18n/locales/en.json` (la interfaz está en inglés).
- Anota el cambio en [`CHANGELOG.md`](CHANGELOG.md), en la sección `[Sin publicar]`.

## 8. Uso de IA

- Si usaste IA en el PR, completa la sección «Uso de IA» de la plantilla (herramienta y modelo, alcance, validación y revisión manual).
- El trabajo con IA se registra en [`docs/bitacora.md`](docs/bitacora.md) y en la trazabilidad del back-end (ver [`README_HITL.md`](https://github.com/wsernam/A-Walking-Dictionary-NovaCode-Back-end/blob/develop/docs/ai/README_HITL.md)).

## 9. Seguridad

- Nunca subas archivos `.env` ni credenciales.
- Para reportar una vulnerabilidad, sigue [`SECURITY.md`](SECURITY.md); no abras un issue público.