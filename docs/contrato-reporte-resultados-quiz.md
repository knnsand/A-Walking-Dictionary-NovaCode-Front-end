# Contrato de datos — Reporte de resultados por quiz en PDF (HU-021)

Este documento describe lo que el frontend implementa y lo que **necesita del backend** para
que la docente descargue en PDF el reporte de resultados de un quiz (HU-021, épica HE-07
«Generación de reportes»). El backend todavía no tiene este endpoint: este contrato es la
propuesta del frontend para implementarlo.

Última actualización: 2026-10-31.

## Origen de la información
- Backlog (HE-07, HU-021) con su spec técnica: endpoint
  `GET /api/v1/reports/quizzes/{id}/results/export-pdf` en Node.js con `pdf-lib`, que consulta
  `resultado_quiz`, `pregunta_quiz` y `respuesta_quiz`, y un botón de descarga en React.
- DER oficial (`init.sql` del backend, rama `develop`): tablas `quiz`, `curso`, `inscripcion`,
  `usuario`, `pregunta_quiz`, `resultado_quiz` y `respuesta_quiz`.
- `docs/contrato-reporte-curso.md` (HU-020) y `docs/contrato-exportacion.md` (HU-3.3): misma
  forma de descargar el PDF y de manejar errores.
- El backend ya tiene `pdf-lib`, `reporteRoutes.js` (montado en `/api/v1/reports`, con el
  límite de peticiones `limiteReportes` de la HU-019) y los helpers de maquetado exportados
  desde `ExportarPDFService.js`.

## Historia de usuario
> Como docente del curso, quiero descargar en PDF el reporte de resultados de un quiz, con la
> calificación de cada estudiante y estadísticas del grupo, para analizar el nivel de dominio
> del vocabulario evaluado.

### Criterios de aceptación
| CA | Dado | Cuando | Entonces |
|----|------|--------|----------|
| **CA-21.1** Resultados individuales del quiz | Un quiz tiene resultados registrados | La docente elige «Exportar resultados» | El PDF lista por estudiante la calificación, el puntaje, el tiempo empleado y la fecha de envío, y marca como «No presentó» a los inscritos sin resultado |
| **CA-21.2** Estadísticas del grupo | El quiz fue presentado por uno o más estudiantes | Se genera el reporte | Incluye el promedio, la nota máxima y mínima, el porcentaje de estudiantes que lo presentó y las preguntas con mayor porcentaje de error; si aún no hay resultados, lo indica sin generar un error |
| **CA-21.3** Restricción de acceso al reporte | Un usuario que no es docente intenta descargar el reporte | Solicita la descarga | El sistema deniega el acceso con error HTTP 403 y no genera el documento |

## Endpoint

| Método y ruta | Archivo descargado | Quién lo usa |
|---------------|--------------------|--------------|
| `GET /api/v1/reports/quizzes/{id}/results/export-pdf` | `quiz-results-{id}.pdf` | Docente |

La ruta es **la misma del backlog**, sin parámetros extra: el quiz ya dice de qué curso es
(`quiz.curso_id`), así que no hace falta un `curso_id`.

Sugerencia de montaje (mismo archivo que la HU-019):

```js
router.get(
  '/quizzes/:id/results/export-pdf',
  limiteReportes,
  authenticate,
  requireRole('docente'),
  ReporteResultadosQuizController.exportarPdf,
);
```

## Autenticación y autorización (CA-21.3)
- Exige `Authorization: Bearer <token>`. El frontend lo envía con `apiDescargarArchivo`.
- Solo rol **docente** (`authenticate` + `requireRole('docente')`, como los PDF de HU-3.3 y la
  decisión D-07).
- **Propuesta (supuesto 1):** además, el quiz debe ser de un curso de la docente que inició
  sesión (`curso.docente_id` del `quiz.curso_id` igual al `id_usuario` del token). Si no lo es,
  responder 403. Sin esto, cambiando el id de la URL se descargarían las notas de los
  estudiantes de otra docente.
- En el frontend el botón solo aparece en la lista de quices de la docente
  (`/docente/quices`, ruta de docente). Esto no reemplaza la validación del backend.

## Respuesta exitosa
- HTTP 200, `Content-Type: application/pdf`, `Content-Disposition: attachment`. **No es JSON.**
- El nombre del archivo lo define el frontend (`quiz-results-{id}.pdf`), porque el navegador no
  expone `Content-Disposition` en peticiones CORS por defecto.

### Qué debe contener el PDF

**Encabezado:** título del quiz (`quiz.titulo`), nombre del curso (`curso.nombre`), semana de
corte (`quiz.semana_corte`), fechas de apertura y cierre, y fecha de generación.

**1. Resultados individuales (CA-21.1).** Una fila por estudiante inscrito en el curso del quiz
(`inscripcion.curso_id = quiz.curso_id`, supuesto 2 sobre el estado de la inscripción),
ordenadas por nombre.

| Columna | De dónde sale (DER) |
|---------|---------------------|
| Nombre | `usuario.nombre_completo` |
| Calificación | `resultado_quiz.calificacion` |
| Puntaje | `resultado_quiz.puntaje_obtenido` / `resultado_quiz.puntaje_maximo` |
| Tiempo empleado | `resultado_quiz.tiempo_empleado_seg` (mostrar en min y s) |
| Fecha de envío | `resultado_quiz.fecha_envio` |

- El inscrito **sin fila en `resultado_quiz`** para ese quiz aparece con **«No presentó»** en la
  calificación y guiones en las demás columnas (no con 0).
- Un estudiante con resultado que ya no esté inscrito (por ejemplo, retirado) también se lista,
  para no perder notas registradas (supuesto 2).

**2. Estadísticas del grupo (CA-21.2).** Calculadas solo con los estudiantes que presentaron:
- Promedio de `calificacion` (2 decimales).
- Nota máxima y nota mínima.
- Porcentaje que lo presentó: estudiantes con resultado ÷ inscritos × 100 (ej. «2 de 3,
  66,7 %»).
- **Preguntas con mayor porcentaje de error**: para cada `pregunta_quiz` del quiz,
  `respuesta_quiz.es_correcta = false` ÷ total de respuestas a esa pregunta × 100. Mostrar el
  enunciado (`pregunta_quiz.enunciado`), el porcentaje y el conteo (ej. «1 de 2»), de mayor a
  menor. Cuántas mostrar: supuesto 4.

**Casos sin datos (no son error):**
- **Quiz sin resultados** (nadie lo ha presentado o aún está programado): el PDF se genera igual;
  la tabla lista a todos los inscritos como «No presentó» y la sección de estadísticas dice que
  aún no hay resultados. **HTTP 200, no 404** (CA-21.2). El frontend muestra el botón en
  cualquier estado del quiz.
- Curso sin estudiantes inscritos: el PDF se genera con un aviso.

### Ejemplo (el mismo que simula el frontend)
```
Quiz: Quiz semanas 1-4 · Curso: Literatura Anglófona

Nombre           | Calificación | Puntaje | Tiempo      | Enviado
Lucía Gómez      | 4.5          | 9/10    | 12 min 40 s | 2026-10-02 10:15
Mateo Rodríguez  | 3.5          | 7/10    | 18 min 05 s | 2026-10-02 11:02
Javier Delgado   | No presentó  | -       | -           | -

Promedio 4.00 · Máxima 4.5 · Mínima 3.5 · Presentaron 2 de 3 (66,7 %)

Preguntas con mayor porcentaje de error
1. "Wander"  — 50,0 % (1 de 2)
2. "Curious" — 50,0 % (1 de 2)
```

## Errores

El backend responde `{ "error": "mensaje legible", "code": "CODIGO" }` (ver
`docs/codigos-error.md` del backend). El frontend reconoce los casos por el texto del mensaje
(`clasificarErrorExportacion` en `exportarPdf.constants.js`), así que **los mensajes de 401 y
403 deben ser los mismos que ya usa el middleware de autenticación**.

| HTTP | Cuándo | Mensaje / código del backend | Qué muestra el frontend |
|------|--------|------------------------------|--------------------------|
| 401 | Sin token o token vencido | `Token de autenticación no proporcionado` / `Token inválido o expirado` (`AUTH_TOKEN_MISSING` / `AUTH_TOKEN_INVALID`) | «Your session expired…» y cierra la sesión |
| 403 | Rol distinto de docente, o quiz de un curso de otra docente | `No tiene permisos para acceder a este recurso` (`AUTH_FORBIDDEN`) | «Your account does not have the teacher role…» |
| 400 | El id no es un entero positivo | `id inválido` | El mensaje del backend |
| 404 | El quiz no existe | `Quiz no encontrado` (`QUIZ_NOT_FOUND`, igual que `QuizController`) | El mensaje del backend |
| 429 | Demasiadas peticiones (`limiteReportes`) | `Demasiadas solicitudes de reportes…` (`RATE_LIMITED`) | El mensaje del backend |
| 500 | Error al generar el PDF | (`INTERNAL_ERROR`) | «Could not generate the PDF. Please try again.» |

El frontend valida el id antes de llamar (entero positivo), así que el 400 solo debería verse si
alguien llama al endpoint directamente.

## Dónde está en la interfaz
- **Lista de quices de la docente** (`/docente/quices`, debajo del formulario de generar quiz):
  cada tarjeta tiene ahora dos botones, «Export printable version» (HU-3.3) y **«Export results
  (PDF)»** (el «Exportar resultados» del CA-21.1; la interfaz está en inglés).
- Mientras se genera el PDF el botón muestra «Generating PDF…» y se bloquea; si falla, el error
  sale debajo del botón.

## Modo con datos simulados
Con `VITE_USE_MOCK=true` el frontend no llama al backend: descarga
`quiz-results-{id}-MOCK.pdf`, un PDF de prueba con datos ficticios y la misma estructura del
ejemplo (`descargarResultadosQuizMock` en `src/cliente-api/mocks/reportesMock.js`).

## Supuestos pendientes de validar
1. **Quiz de la docente:** se propone validar `curso.docente_id` y responder 403 si el quiz es
   de otra docente (igual que se pidió en la HU-020). Hoy `GET /quizzes/:id/export-pdf` (HU-3.3)
   solo valida el rol.
2. **Qué inscritos cuentan:** se propone `inscripcion.estado = 'activa'` (como
   `QuizRepository` y `MazoRepository`) para «No presentó» y para el porcentaje, pero listando
   también a quien tenga resultado aunque su inscripción ya no esté activa.
3. **Escala de la nota:** se muestra `resultado_quiz.calificacion` tal cual (0-5, supuesto P2 del
   backend). Recordar que los DECIMAL llegan de `pg` como string: convertir antes de promediar.
4. **Cuántas preguntas con error mostrar:** se proponen las **5** con mayor porcentaje (o todas
   si el quiz tiene menos), desempatando por `pregunta_quiz.orden`. Las preguntas sin respuestas
   no entran.
5. **Respuestas en blanco:** si el tiempo se agota (CA-3.2.1), una pregunta sin fila en
   `respuesta_quiz` no cuenta en el porcentaje de error de esa pregunta; confirmar si debería
   contar como error.

## Lo que el frontend NO hace
- No arma el contenido del PDF ni calcula estadísticas: lo hace el backend con `pdf-lib`.
- No oculta el botón según el estado del quiz: el backend decide qué mostrar si aún no hay
  resultados (sin error).

## Historial de cambios
### 2026-10-31
- Primera versión: `exportarResultadosQuizPdf` en `reportesApi.js`, PDF simulado
  `descargarResultadosQuizMock` en `reportesMock.js`, botón «Export results (PDF)» en
  `ListaQuices.jsx`, textos en `en.json` y pruebas (`reportesApi.test.js`,
  `ListaQuices.test.jsx`).
