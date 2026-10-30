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

### Criterios de aceptación
| CA | Dado | Cuando | Entonces |
|----|------|--------|----------|
| **CA-20.1** Listado de estudiantes y aportes | Existen estudiantes inscritos en el curso y la docente elige «Exportar reporte de estudiantes» | Se genera el PDF | Incluye el nombre del curso, la fecha de generación y una tabla con nombre, código, nivel MCER, palabras añadidas, palabras aprobadas y coautorías de cada estudiante, junto con los totales del grupo |
| **CA-20.2** Notas de quices por estudiante | Existen quices presentados | Se genera el reporte | Muestra la calificación de cada estudiante en cada quiz y su promedio, marcando «No presentó» donde corresponda; si no hay quices, la sección lo indica sin generar un error |
| **CA-20.3** Restricción de acceso al reporte | Un usuario que no es docente intenta descargar el reporte | Solicita la descarga | El sistema deniega el acceso con error HTTP 403 y no genera el documento |

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

## Autenticación y autorización (CA-20.3: restricción de acceso)
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

**Encabezado:** nombre del curso (`curso.nombre`) y fecha de generación.

**Tabla de estudiantes y aportes (CA-20.1).** Una fila por estudiante inscrito
(`inscripcion.curso_id`) y al final una fila **Totales del grupo** con la suma de las
columnas numéricas.

| Columna | De dónde sale (DER y código actual del backend) |
|---------|--------------------------------------------------|
| Nombre | `usuario.nombre_completo` |
| Código | `usuario.codigo_estudiantil` |
| Nivel MCER | `usuario.nivel_ingles` |
| Palabras añadidas | `aporte` del estudiante (por `inscripcion_id`) con `tipo_aporte = 'creada'` |
| Palabras aprobadas | De las anteriores, las que tienen `tarjeta.estado = 'revisado_docente'` (supuesto 2) |
| Coautorías | `aporte` con `tipo_aporte = 'coautoria'` (supuesto 3) |

**Notas de quices (CA-20.2).** Para cada estudiante, la calificación en cada quiz del curso
(`quiz.curso_id` ← `resultado_quiz.calificacion` por `estudiante_id`) y su **promedio**.
- Si el estudiante no presentó un quiz, se escribe **«No presentó»**, no un 0.
- Si el curso no tiene quices, la sección dice que no hay quices y el PDF se genera igual
  (sin error).

**Casos sin datos (no son error):**
- Un estudiante sin aportes aparece igual, con ceros.
- Un curso sin estudiantes genera el PDF con un aviso, como el PDF de un mazo sin tarjetas
  aprobadas (HU-3.3). El frontend muestra el botón aunque el curso esté vacío.

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
- **Detalle del curso** (`/docente/cursos/:id`): botón «Export student report (PDF)» (el
  «Exportar reporte de estudiantes» del CA-20.1; la interfaz está en inglés) encima de
  la tabla de estudiantes. Aparece cuando el curso cargó, aunque no tenga estudiantes.
- En la misma tabla siguen los botones del reporte individual de cada estudiante (HU-018).
- Mientras se genera el PDF el botón muestra «Generating PDF…» y se bloquea.

## Modo con datos simulados
Con `VITE_USE_MOCK=true` el frontend no llama al backend: descarga
`course-report-{id}-MOCK.pdf`, un PDF de prueba con datos ficticios y la misma estructura que
pide este contrato: encabezado, tabla con totales, notas con promedio y «No presentó»
(`src/cliente-api/mocks/reportesMock.js`).

## Supuestos pendientes de validar
1. **Parámetro `curso_id`** (ver arriba). Si se prefiere `course_id`, para coincidir con el
   `student_id` de la HU-019, se cambia en el frontend.
2. **Palabras aprobadas:** se propone `tarjeta.estado = 'revisado_docente'`; confirmar que no
   sea `aporte.estado = 'aprobado'`.
3. **Coautorías:** confirmar si los aportes `acepcion_nueva` también cuentan.
4. **Promedio de quices:** confirmar si los quices no presentados se excluyen del promedio
   (propuesta) o cuentan como 0.
5. **Escala de la nota:** se muestra `resultado_quiz.calificacion` tal cual; la escala (0-5)
   sigue pendiente de confirmar con la docente (supuesto P2 del backend).

## Lo que el frontend NO hace
- No arma el contenido del PDF: lo genera el backend con `pdf-lib`.
- No filtra por semana ni por quiz: el reporte es del semestre completo.

## Historial de cambios
### 2026-10-29 (ajuste a los CA detallados)
- Se copian los CA-20.1 a CA-20.3 textuales de la HU.
- El contenido del PDF pasa a ser una tabla con nivel MCER, palabras aprobadas y totales del
  grupo; se agregan el promedio de quices, «No presentó» y el caso de curso sin quices.
- El botón pasa a «Export student report (PDF)» y el PDF simulado sigue la nueva estructura.

### 2026-10-29
- Primera versión: `exportarReporteCursoPdf` en `reportesApi.js`, PDF simulado en
  `reportesMock.js`, botón en `DetalleCurso.jsx`, textos en `en.json` y pruebas
  (`reportesApi.test.js`, `DetalleCurso.test.jsx`).
