# Contrato de datos — Quiz acumulativo (HU-3.1)

Este documento describe lo que el frontend implementa y espera del backend para
generar quices acumulativos (HU-3.1 en el backlog Gherkin; HU-007 en la Entrega 1,
EPIC-003). Es un contrato de referencia: todo lo marcado como **Requisito para el
backend** debe ser implementado por el equipo de backend (William). El frontend no
implementa lógica de backend.

## Origen de la información
- HU-3.1 y criterios CA-3.1.1, CA-3.1.2 y CA-3.1.3 (backlog Gherkin).
- HU-007 — Criterios de aceptación y especificaciones técnicas (Entrega 1, EPIC-003).
- Tablas `quiz`, `quiz_mazo` y `pregunta_quiz` de `init.sql` (backend).
- Decisiones aceptadas durante el diseño de la historia (ver la sección «Decisiones aceptadas para esta historia»).

## Estado del backend al momento de redactar este contrato
- `POST /api/v1/quizzes/generate` **no existe** todavía.
- `QuizService.js` contiene solo comentarios; `quizRoutes.js` y `QuizController.js`
  son un CRUD genérico que no está montado en `app.js`.

## Endpoint oficial
`POST /api/v1/quizzes/generate`

Nota de numeración: el comentario de `QuizService.js` menciona `POST /api/v1/quizzes`;
el endpoint oficial de la especificación técnica es `/quizzes/generate`.

## Autenticación y autorización
**Requisito para el backend:**
- Ruta nueva, independiente del CRUD genérico de `quizRoutes.js` (que no tiene
  autenticación y no debe montarse tal cual).
- Debe usar los middlewares `authenticate` y `requireRole('docente')`, igual que
  `analiticaRoutes.js`.
- Sin token válido: HTTP 401. Con rol distinto de docente: HTTP 403 (CA-5.4.2).

## Decisiones aceptadas para esta historia
- Solo preguntas de **opción múltiple** (la palabra como enunciado y cuatro opciones).
  La asociación término-definición y "completar contexto" quedan como trabajo futuro.
- Las opciones se toman de `tarjeta.traduccion` (`VARCHAR(255)`), porque
  `tarjeta.definicion` es `TEXT` y podría superar el límite de `opcion_*` (255).
- Cada pregunta requiere 1 respuesta correcta y 3 distractores distintos, por lo que
  se necesitan al menos 4 **traducciones distintas** entre las tarjetas en estado
  `revisado_docente` de los mazos seleccionados. Para compararlas se ignoran
  mayúsculas y espacios sobrantes. Con este mínimo, toda tarjeta tiene siempre al
  menos 3 distractores posibles.
- El quiz se guarda en estado `programado`. El estado "publicado" **no** se guarda:
  se deriva al consultar, comparando `fecha_apertura` con la hora actual, sin tareas
  en segundo plano (el equipo descartó el polling por los planes gratuitos).
- Las fechas viajan en UTC (ISO 8601 con `Z`).

## Cuerpo de la petición (request)

`Content-Type: application/json`

```json
{
  "curso_id": 1,
  "titulo": "Quiz acumulativo - Semanas 1 a 4",
  "mazos_ids": [1, 2, 3, 4],
  "fecha_apertura": "2026-10-12T20:00:00.000Z",
  "fecha_cierre": "2026-10-14T04:59:00.000Z",
  "tiempo_limite_min": 30
}
```

| Campo               | Tipo              | Origen en el frontend                                   | Obligatorio | Columna de destino |
|---------------------|-------------------|----------------------------------------------------------|-------------|--------------------|
| `curso_id`          | number            | Lista de cursos (`GET /api/v1/courses`)                  | Sí          | `quiz.curso_id`    |
| `titulo`            | string (máx. 200) | Formulario                                               | Sí          | `quiz.titulo`      |
| `mazos_ids`         | array de number   | Mazos seleccionados por la docente (mínimo 1)            | Sí          | `quiz_mazo.mazo_id` (una fila por mazo) |
| `fecha_apertura`    | string (ISO 8601, UTC) | Formulario, convertida de hora local a UTC          | Sí          | `quiz.fecha_apertura` |
| `fecha_cierre`      | string (ISO 8601, UTC) | Formulario, convertida de hora local a UTC          | Sí          | `quiz.fecha_cierre` |
| `tiempo_limite_min` | number (entero)   | Formulario                                               | Sí          | `quiz.tiempo_limite_min` |

### Campos que el frontend NO envía
- `estado`: el backend lo asigna siempre como `"programado"` (CA-3.1.3).
- `fecha_creacion`: la genera la base de datos.
- `semana_corte`: es obligatoria en la tabla `quiz`. **Requisito para el backend:**
  calcularla como la semana mayor entre los mazos seleccionados (`MAX(mazo.semana)`),
  para evitar inconsistencias entre lo seleccionado y lo enviado.

### Validaciones del frontend (previas al envío)
- Al menos un mazo seleccionado.
- `titulo` no vacío y de máximo 200 caracteres.
- `fecha_apertura` posterior a la hora actual.
- `fecha_cierre` posterior a `fecha_apertura`.
- La ventana entre apertura y cierre (`fecha_cierre` menos `fecha_apertura`, en minutos) debe ser mayor o igual que `tiempo_limite_min`; de lo contrario el quiz se cerraría antes de poder completarse.
- `tiempo_limite_min` entero y mayor que 0.

### Validaciones que debe repetir el backend
**Requisito para el backend:** la validación del frontend es solo de usabilidad; el
backend debe validar los mismos puntos, verificar que `curso_id` y todos los
`mazos_ids` existan y que los mazos pertenezcan al curso indicado.

**Requisito para el backend:** debe rechazar con HTTP 400 toda solicitud en la que la ventana (`fecha_cierre` menos `fecha_apertura`, en minutos) sea menor que `tiempo_limite_min`, e indicar el motivo en el mensaje de error.

## Respuesta exitosa (HTTP 201)

```json
{
  "id_quiz": 12,
  "curso_id": 1,
  "titulo": "Quiz acumulativo - Semanas 1 a 4",
  "semana_corte": 4,
  "mazos_ids": [1, 2, 3, 4],
  "fecha_apertura": "2026-10-12T20:00:00.000Z",
  "fecha_cierre": "2026-10-14T04:59:00.000Z",
  "tiempo_limite_min": 30,
  "estado": "programado",
  "total_preguntas": 24
}
```

- `estado` es siempre `"programado"` al crear el quiz (CA-3.1.3).
- `total_preguntas` es el número de filas creadas en `pregunta_quiz`.
- La respuesta **no** incluye las preguntas ni las respuestas correctas: la pantalla de configuración solo muestra un resumen de confirmación.

## Errores

Todos los errores usan el formato `{ "error": "mensaje legible" }`.

| HTTP | Cuándo ocurre | Qué hace el frontend |
|------|---------------|----------------------|
| 400  | Falta un campo obligatorio, un valor es inválido, la ventana de tiempo es menor que `tiempo_limite_min`, o `mazos_ids` está vacío | Muestra el mensaje junto al formulario |
| 401  | Token ausente o inválido | Redirige al inicio de sesión |
| 403  | El usuario autenticado no tiene rol docente | Muestra mensaje de acceso denegado |
| 404  | `curso_id` o alguno de los `mazos_ids` no existe, o el mazo no pertenece al curso | Muestra el mensaje |
| 422  | Hay menos de 4 traducciones distintas entre las tarjetas `revisado_docente` de los mazos seleccionados | Muestra el mensaje e invita a seleccionar más mazos o a aprobar más tarjetas |
| 500  | Error interno | Muestra un mensaje genérico de error |

Para el HTTP 422, **Requisito para el backend:** el mensaje debe indicar cuántas traducciones
distintas se encontraron y cuántas se requieren, por ejemplo:
`"Se encontraron 3 traducciones distintas; se requieren al menos 4."`

## Requisitos de integridad para el backend
- La creación de `quiz`, `quiz_mazo` y `pregunta_quiz` debe hacerse en una **única
  transacción**: si falla cualquier inserción, no debe quedar un quiz incompleto.
- Solo se consideran tarjetas con `tarjeta.estado = 'revisado_docente'` pertenecientes a
  los mazos de `mazos_ids` (CA-3.1.1).
- Los 3 distractores de cada pregunta deben ser traducciones distintas entre sí y
  distintas de la correcta; se eligen al azar entre las demás tarjetas aprobadas
  seleccionadas (CA-3.1.2). Si dos tarjetas comparten la misma traducción, no pueden
  aparecer juntas como opciones de una misma pregunta.
- Las cuatro opciones deben quedar ubicadas en orden aleatorio entre `opcion_a` y `opcion_d`.

## Número de preguntas por quiz (decisión provisional)

**Regla actual:** se genera una pregunta por cada tarjeta `revisado_docente` de los mazos seleccionados. Por tanto, `total_preguntas` es igual al número de tarjetas aprobadas encontradas.

**Estado:** provisional. Está sujeta a cambio si la docente solicita limitar la longitud del quiz (por ejemplo, un máximo de preguntas o una muestra aleatoria).

**Requisito para el backend:** definir esta regla en un único lugar del código (por ejemplo, una constante o función en `QuizService.js`), de modo que modificarla no requiera cambiar la estructura de la petición ni de la respuesta.

**Compromiso del frontend:** no asume ningún número fijo de preguntas; muestra siempre el valor `total_preguntas` recibido en la respuesta.

**No incluido en esta versión:** un campo opcional como `max_preguntas` en la petición. Si la docente pide cambiar la regla, se agregaría como actualización de este contrato.