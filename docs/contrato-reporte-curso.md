# Contrato de datos — Reporte de estudiantes del curso en PDF (HU-020)

Este documento describe lo que el frontend implementa y lo que **necesita del backend** para
que la docente descargue en PDF el reporte consolidado de los estudiantes de un curso (HU-020,
Sprint 4). El backend todavía no tiene este endpoint: este contrato es la propuesta del
frontend para implementarlo.

Última actualización: 2026-10-29.

## Origen de la información
- Tarjeta de Trello «HU-020 - Reporte de estudiantes del curso en PDF» (Sprint 4).
- DER oficial (`init.sql` del backend, rama `develop`): tablas `usuario`, `curso`,
  `inscripcion`, `aporte`, `tarjeta`, `quiz` y `resultado_quiz`.
- `docs/contrato-exportacion.md` (frontend): misma forma de descargar PDF y de manejar errores
  que los PDF de mazos y quices (HU-3.3).
- El backend ya tiene `pdf-lib` en `package.json`, que es la librería que pide la tarjeta.

## Historia de usuario
> Como docente del curso, quiero descargar en PDF un reporte consolidado de los estudiantes del
> curso, con las palabras añadidas por cada uno, su nota en los quices y su participación, para
> evaluar el desempeño del grupo y tener un registro imprimible del seguimiento del semestre.

### Criterios de aceptación (tarjeta)
1. Listado de estudiantes y aportes.
2. Notas de quices por estudiante.
3. Restricción de acceso al reporte.

## Endpoint

| Método y ruta | Archivo descargado | Quién lo usa |
|---------------|--------------------|--------------|
| `GET /api/v1/reports/students/export-pdf?curso_id={id}` | `course-report-{id}.pdf` | Docente |

### ⚠️ Propuesta pendiente de validar: parámetro `curso_id`
La tarjeta define la ruta `GET /api/v1/reports/students/export-pdf`, pero **no dice de qué curso
es el reporte**, y una docente puede tener varios cursos (`curso.docente_id`). El frontend
propone enviar el curso como query param **`curso_id`**, sin cambiar la ruta de la tarjeta:

```
GET /api/v1/reports/students/export-pdf?curso_id=3
```

- Si el equipo decide otra forma (por ejemplo, ruta `/reports/courses/:id/export-pdf` o sacar
  el curso del token), el cambio en el frontend es una sola línea en
  `src/cliente-api/reportesApi.js` (`exportarReporteCursoPdf`).
- Se consultó si la HU-019 ya había resuelto esto; al 2026-10-29 la HU-019 no está
  implementada en ninguna rama del front ni del back.

## Autenticación y autorización (CA 3: restricción de acceso)
- Exige `Authorization: Bearer <token>`. El frontend lo envía con `apiDescargarArchivo`.
- Solo rol **docente** (`authenticate` + `requireRole('docente')`, igual que los PDF de HU-3.3).
- **Además**, el curso debe ser de la docente que inició sesión: `curso.docente_id` igual al
  `id_usuario` del token. Si no lo es, responder 403 (no se debe poder descargar el reporte de
  los estudiantes de otra docente cambiando el `curso_id`).
- En el frontend el botón solo existe en `/docente/cursos/:id`, ruta protegida por
  `RutaSoloDocente`. Esto no reemplaza la validación del backend.

## Respuesta exitosa
- HTTP 200, `Content-Type: application/pdf`, `Content-Disposition: attachment`. **No es JSON.**
- El nombre del archivo lo define el frontend (`course-report-{id}.pdf`), porque el navegador no
  expone `Content-Disposition` en peticiones CORS por defecto.

### Qué debe contener el PDF
Encabezado con el nombre y el periodo del curso (`curso.nombre`, `curso.periodo`) y la fecha de
generación. Luego, **una sección por cada estudiante inscrito** (`inscripcion.curso_id`):

| Dato | Tablas del DER | Criterio |
|------|----------------|----------|
| Nombre y código estudiantil | `usuario.nombre_completo`, `usuario.codigo_estudiantil` | CA 1 |
| Palabras añadidas (cada palabra con su estado) | `aporte` (por `inscripcion_id`) → `tarjeta.palabra`, `tarjeta.estado` | CA 1 |
| Participación: total de palabras y de coautorías | `aporte.tipo_aporte` | CA 1 |
| Nota de cada quiz del curso | `quiz` (por `curso_id`) ← `resultado_quiz.calificacion` (por `estudiante_id`) | CA 2 |

Sugerencias, a validar con el equipo:
- Contar participación con el mismo criterio que `GET /teacher/analytics/deck/:id` (HU-2.3)
  para que los números coincidan con el panel de participación.
- Un quiz sin envío del estudiante se muestra como «Not submitted», no como 0.
- Un estudiante sin aportes ni quices igual aparece en el reporte (con «No contributions»).
- Un curso sin estudiantes **no da error**: el PDF trae un aviso, como el PDF de un mazo sin
  tarjetas aprobadas (HU-3.3). El frontend muestra el botón aunque el curso esté vacío.

## Errores

El backend responde `{ "error": "mensaje legible", "code": "CODIGO" }` (ver
`docs/codigos-error.md` del backend). El frontend reconoce los casos por el texto del mensaje
(`clasificarErrorExportacion` en `exportarPdf.constants.js`), así que **los mensajes de 401 y
403 deben ser los mismos que ya usa el middleware de autenticación**.

| HTTP | Cuándo | Mensaje del backend | Qué muestra el frontend |
|------|--------|---------------------|--------------------------|
| 401 | Sin token o token vencido | `Token de autenticación no proporcionado` / `Token inválido o expirado` | «Your session expired…» y cierra la sesión |
| 403 | Rol distinto de docente, o curso de otra docente | `No tiene permisos para acceder a este recurso` | «Your account does not have the teacher role…» |
| 400 | `curso_id` falta o no es un entero positivo | `id inválido` | El mensaje del backend |
| 404 | El curso no existe | `Curso no encontrado` (`COURSE_NOT_FOUND`, igual que `CursoController`) | El mensaje del backend |
| 500 | Error al generar el PDF | (mensaje técnico) | «Could not generate the PDF. Please try again.» |

El frontend valida el id antes de llamar (entero positivo), así que el 400 solo debería verse si
alguien llama al endpoint directamente.

## Dónde está en la interfaz
- **Detalle del curso** (`/docente/cursos/:id`): botón «Download course report (PDF)» encima de
  la tabla de estudiantes. Aparece cuando el curso cargó, aunque no tenga estudiantes.
- En la misma tabla siguen los botones del reporte individual de cada estudiante (HU-018).
- Mientras se genera el PDF el botón muestra «Generating PDF…» y se bloquea.

## Modo con datos simulados
Con `VITE_USE_MOCK=true` el frontend no llama al backend: descarga
`course-report-{id}-MOCK.pdf`, un PDF de prueba con tres estudiantes ficticios
(`src/cliente-api/mocks/reportesMock.js`).

## Supuestos pendientes de validar
1. **Parámetro `curso_id`** (ver arriba).
2. **Qué cuenta como «palabra añadida»:** el frontend asume los aportes del estudiante en el
   curso; falta decidir si se listan todas o solo las de tipo `creada`.
3. **Escala de la nota:** se muestra `resultado_quiz.calificacion` tal cual; la escala (0-5)
   sigue pendiente de confirmar con la docente (supuesto P2 del backend).

## Lo que el frontend NO hace
- No arma el contenido del PDF: lo genera el backend con `pdf-lib`.
- No filtra por semana ni por quiz: el reporte es del semestre completo.

## Historial de cambios
### 2026-10-29
- Primera versión: `exportarReporteCursoPdf` en `reportesApi.js`, PDF simulado en
  `reportesMock.js`, botón en `DetalleCurso.jsx`, textos en `en.json` y pruebas
  (`reportesApi.test.js`, `DetalleCurso.test.jsx`).
