# Documentación — A Walking Dictionary (Front-end)

Índice de la documentación de este repositorio. La documentación del back-end está en su propio repositorio:
[`docs/README.md` del Back-end](https://github.com/wsernam/A-Walking-Dictionary-NovaCode-Back-end/blob/develop/docs/README.md).

Dónde vive cada cosa:

| Tema | Repositorio |
| --- | --- |
| Manuales de usuario, contratos Front → Back, documentación de componentes, pruebas E2E | **Front-end** (aquí) |
| Especificación de la API (OpenAPI), arquitectura (Arc42), contratos Back → Front, flujos, códigos de error | **Back-end** |

## Estado de los marcos de documentación

| Marco / estándar | Ubicación | Estado |
| --- | --- | --- |
| Documentación de usuario (IEEE 1063 / ISO/IEC/IEEE 26514) | `docs/usuario/` | Pendiente |
| Documentación de componentes | `docs/componentes/` | Pendiente |
| Documentación del código (JSDoc) | Comentarios en `src/` | Parcial |
| OpenAPI y Arc42 | Back-end: `docs/api/` y `docs/arquitectura/arc42/` | Ver el índice del back-end |

## Contratos de datos con el backend

Cada contrato describe qué consume el front y qué espera del backend para una historia de usuario.

| Documento | Contenido |
| --- | --- |
| [`contrato-mazo.md`](contrato-mazo.md) | Mazo |
| [`contrato-perfil.md`](contrato-perfil.md) | Perfil académico del estudiante (HU-013) |
| [`contrato-inscripcion.md`](contrato-inscripcion.md) | Inscripción a cursos (HU-014) |
| [`contrato-quiz.md`](contrato-quiz.md) | Quiz acumulativo (HU-3.1) |
| [`contrato-quiz-estudiante.md`](contrato-quiz-estudiante.md) | Quices del estudiante (HU-3.2 y lista de quices) |
| [`contrato-exportacion.md`](contrato-exportacion.md) | Exportar mazos y quices a PDF (HU-3.3) |
| [`contrato-reporte-curso.md`](contrato-reporte-curso.md) | Reporte de estudiantes del curso en PDF (HU-020) |
| [`contrato-reporte-resultados-quiz.md`](contrato-reporte-resultados-quiz.md) | Reporte de resultados por quiz en PDF (HU-021) |

## Pruebas

| Documento | Contenido |
| --- | --- |
| [`../e2e/README.md`](../e2e/README.md) | Pruebas E2E con Playwright: cómo ejecutarlas, login simulado, reportes y métricas |

## Proceso

| Documento | Contenido |
| --- | --- |
| [`bitacora.md`](bitacora.md) | Bitácora de trabajo con IA del front-end (prompts, decisiones y resultados) |

## Gobernanza del proyecto

| Documento | Contenido |
| --- | --- |
| [`../CONTRIBUTING.md`](../CONTRIBUTING.md) | Flujo de ramas, commits, Pull Requests y uso de IA |
| [`../SECURITY.md`](../SECURITY.md) | Cómo reportar vulnerabilidades (Security Advisories de GitHub) |
| [`../CHANGELOG.md`](../CHANGELOG.md) | Resumen de cambios (formato Keep a Changelog) |