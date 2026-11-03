# Bitácora de trabajo con IA — Frontend

Registro de las tareas hechas con asistencia de IA en el frontend: el prompt que se le dio,
las decisiones tomadas y el resultado. Cada entrada va de la más reciente a la más antigua.

---

## 2026-10-31 — HU-021: Reporte de resultados por quiz en PDF

- **Responsable:** wsernam
- **Herramienta y modelo:** Claude Code (Claude Opus 5.5)
- **Rama:** `feature/HU-021-reporte-resultados-quiz-pdf` (desde `develop`)
- **Épica:** HE-07 «Generación de reportes»
- **Alcance:** solo frontend. El backend se implementa aparte con el contrato
  `docs/contrato-reporte-resultados-quiz.md`.

### Prompts
1. «hola puedes leer el claude.md que se encuentra en el back end?»
2. «listo entonces en el flujo del trabajo nos tocó implementar estas HU nuevas, puedes
   implementarlas, la épica es la 07 y se llama generación de reporte, me toca implementar en
   el back la HU-021 que corresponde reporte resultado por quiz en PDF. Recuerda que hay una
   bitácora así que si puedes registra este prompt, solo estoy trabajando el front así que en
   doc toca dejar un contrato para que el back sepa qué implementar o se alinee con lo que ya
   implementó» (con capturas de la HU-021 y de sus CA-21.1 a CA-21.3).

### Contexto revisado por la IA
- `CLAUDE.md` del backend: no inventar endpoints ni parámetros (los datos que falten van como
  supuestos pendientes de validar), registrar las decisiones y no hacer commit sin aprobación.
- Backend (`develop`): todavía no existe el endpoint de la HU-021. Ya están `reporteRoutes.js`
  (HU-019, con `limiteReportes`), `pdf-lib`, los helpers de `ExportarPDFService.js` y el código
  `QUIZ_NOT_FOUND`. El DER tiene todas las columnas que piden los CA (`resultado_quiz`,
  `respuesta_quiz.es_correcta`, `pregunta_quiz.enunciado`).
- Frontend: la lista de quices de la docente (`ListaQuices.jsx`) ya tiene el botón de la
  versión impresa (HU-3.3); las HU-018/019/020 usan `reportesApi.js` y `BotonExportarPdf`.

### Decisiones
| Decisión | Quién | Motivo |
|----------|-------|--------|
| Usar la ruta del backlog sin parámetros extra | IA | El quiz ya trae su `curso_id`; no hace falta inventar parámetros. |
| Botón «Export results (PDF)» en cada tarjeta de la lista de quices de la docente | IA | Ahí está el botón de la versión impresa del mismo quiz. |
| Mostrar el botón en cualquier estado del quiz | IA | El CA-21.2 pide que el PDF se genere aunque no haya resultados. |
| Pedir al backend que valide que el quiz sea de un curso de la docente | IA (supuesto 1 del contrato) | Sin eso, cambiando el id se verían las notas de otra docente. |

### Resultado
- `src/cliente-api/reportesApi.js`: `exportarResultadosQuizPdf(idQuiz)` llama a
  `GET /api/v1/reports/quizzes/{id}/results/export-pdf` y valida que el id sea entero positivo.
  También se ordenó el comentario del archivo y el import de los mocks.
- `src/cliente-api/mocks/reportesMock.js`: `descargarResultadosQuizMock`, PDF de prueba con la
  estructura del contrato.
- `src/vistas/quices/ListaQuices.jsx` y `listaQuices.constants.js`: segundo botón en las
  tarjetas de la docente.
- `src/i18n/locales/en.json`: `exportActions.quizResults` y `exportActions.quizResultsAria`.
- Pruebas: `reportesApi.test.js` (ruta, nombre del archivo, ids inválidos y mock) y
  `ListaQuices.test.jsx` (descarga del quiz correcto y aviso ante 403).
- `docs/contrato-reporte-resultados-quiz.md`: contrato para el backend (endpoint, permisos,
  contenido del PDF con las tablas del DER, errores y 5 supuestos).

### Validación
Al principio no se pudieron correr porque la máquina no tenía Node. wsernam instaló Node desde
nodejs.org (v26.13.0, npm 11.20.0; el CI usa Node 22) y se corrió `npm ci`:
- `npm run lint`: 0 errores (los mismos 6 warnings que ya tenía `develop`, en archivos que esta
  HU no toca).
- `npm test`: 440/440 pruebas (12 nuevas; `develop` tenía 428).
- `npm run build`: compila sin errores.

### Criterios de aceptación
| Criterio | Estado en el frontend |
|----------|-----------------------|
| CA-21.1 Resultados individuales | Botón «Export results (PDF)». La tabla con calificación, puntaje, tiempo, fecha y «No presentó» la genera el backend; pedida en el contrato y simulada en el mock. |
| CA-21.2 Estadísticas del grupo | Promedio, máxima, mínima, % que presentó y preguntas con más error: los genera el backend; pedidos en el contrato y simulados en el mock. El botón se muestra aunque no haya resultados. |
| CA-21.3 Restricción de acceso | Botón solo en la vista de docente; manejo de 401 (cierra sesión) y 403 (aviso). La validación real se pide al backend. |

### Pendiente
- Que el equipo valide los supuestos del contrato y que el backend implemente el endpoint.
- Probar contra el backend real (hoy solo con `VITE_USE_MOCK=true`).
- Revisión manual del código por un integrante del equipo.

---

## 2026-10-29 — HU-020: Reporte de estudiantes del curso en PDF

- **Responsable:** wsernam
- **Herramienta y modelo:** Claude Code (Claude Opus 5.5)
- **Rama:** `feature/HU-020-reporte-curso-pdf` (desde `develop`)
- **Alcance:** solo frontend. El backend se implementa aparte con el contrato
  `docs/contrato-reporte-curso.md`.

### Prompts
1. «hola ayudame a hacer esta tarea me toca hacerlo en el front» (con captura de la tarjeta de
   Trello de la HU-020).
2. Respuesta a las preguntas de la IA: botón en el **detalle del curso**; y sobre el parámetro
   del curso: «pregunta el reporte del modo estudio HU 019 implementa este parámetro que me dices
   o lo hizo sin parámetro».
3. «podemos trabajar en el front y dejar un contrato que le diga al back que implemente lo que
   pides, recuerda leer el claude.md que se encuentra en el back y dejar una bitacora.md con el
   prompt que te mande y el resultado».
4. Captura de los CA detallados de la HU-020 (CA-20.1 a CA-20.3) con la pregunta «¿sí
   cumplimos con esto?», y luego «¿y por qué no lo corriges, qué esperas?».

### Contexto revisado por la IA
- `CLAUDE.md` del backend (rama `develop`): no inventar endpoints ni parámetros (si falta un
  dato, marcarlo como supuesto pendiente de validar), presentar un plan antes de escribir código
  y no hacer commit sin aprobación.
- Backend: no existe ningún endpoint `/reports` todavía; `pdf-lib` ya está instalado; el DER
  tiene `curso.docente_id`.
- HU-019: no está implementada en ninguna rama del front ni del back, así que no había un
  precedente para el parámetro del curso.

### Decisiones
| Decisión | Quién | Motivo |
|----------|-------|--------|
| Enviar el curso como `?curso_id=` | Propuesta de la IA, aceptada por wsernam | La ruta de la tarjeta no dice de qué curso es el reporte. Queda como **supuesto pendiente de validar** en el contrato. |
| Botón en el detalle del curso (`/docente/cursos/:id`) | wsernam | Ahí ya están los reportes individuales de la HU-018. |
| Pedir al backend que valide que el curso sea de la docente | IA | Sin eso, cambiando el `curso_id` se descargaría el reporte de otra docente (CA 3). |

### Resultado
- `src/cliente-api/reportesApi.js`: nueva función `exportarReporteCursoPdf(idCurso)` que llama a
  `GET /api/v1/reports/students/export-pdf?curso_id={id}` y valida que el id sea un entero
  positivo. La validación del id se comparte con la función de la HU-018.
- `src/cliente-api/mocks/reportesMock.js`: PDF de prueba del curso para `VITE_USE_MOCK=true`; la
  lógica de descarga se movió a un helper compartido con el mock de la HU-018.
- `src/vistas/docente/cursos/DetalleCurso.jsx` y `detalle-curso.css`: botón «Export student
  report (PDF)» encima de la tabla, con `BotonExportarPdf` (estado de carga y errores 401/403).
- `src/i18n/locales/en.json`: textos `courseDetail.downloadCourseReport` y
  `courseDetail.downloadCourseReportFor`.
- Pruebas nuevas: `src/cliente-api/reportesApi.test.js` (HU-018 y HU-020) y
  `src/vistas/docente/cursos/DetalleCurso.test.jsx` (botón del curso, curso vacío, 403, 401,
  error de carga y botón individual de la HU-018).
- `docs/contrato-reporte-curso.md`: contrato para el backend (endpoint, permisos, contenido del
  PDF con las tablas del DER, errores y supuestos).

### Ajuste por los CA detallados (prompt 4)
La primera versión del contrato se hizo con el resumen de la tarjeta. Al comparar con los CA
detallados faltaban datos del PDF, así que se ajustó:
- Contrato: CA textuales; tabla con nivel MCER, palabras añadidas/aprobadas, coautorías y
  totales del grupo; promedio de quices, «No presentó» y curso sin quices sin error. Los valores
  (`tipo_aporte = 'creada'`, `tarjeta.estado = 'revisado_docente'`) se tomaron del `init.sql`
  y del código actual del backend; los dudosos quedan como supuestos.
- PDF simulado con la misma estructura.
- Botón renombrado a «Export student report (PDF)», como el «Exportar reporte de estudiantes»
  del CA-20.1 (la interfaz está en inglés).

### Validación
- `npm run lint`: 0 errores (los mismos 6 warnings que ya tenía `develop`).
- `npm test`: 428/428 pruebas (20 nuevas).
- `npm run build`: compila sin errores.

### Criterios de aceptación
| Criterio | Estado en el frontend |
|----------|-----------------------|
| CA-20.1 Listado de estudiantes y aportes | Botón «Export student report (PDF)». La tabla con nivel MCER, aportes y totales la genera el backend; pedida en el contrato y simulada en el mock. |
| CA-20.2 Notas de quices por estudiante | Notas, promedio, «No presentó» y curso sin quices: los genera el backend; pedidos en el contrato y simulados en el mock. |
| CA-20.3 Restricción de acceso al reporte | Botón solo en rutas de docente; manejo de 401 (cierra sesión) y 403 (aviso). La validación real (rol y dueña del curso) se pide al backend en el contrato. |

### Pendiente
- Que el equipo valide el parámetro `curso_id` y que el backend implemente el endpoint.
- Probar contra el backend real cuando exista el endpoint (hoy solo se puede probar con
  `VITE_USE_MOCK=true`).
- Revisión manual del código por un integrante del equipo.
