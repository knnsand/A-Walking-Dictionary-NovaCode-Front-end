# Contrato de datos — Quiz acumulativo (HU-3.1)

Este documento describe lo que el frontend implementa y consume para generar quices
acumulativos (HU-3.1 en el backlog Gherkin; HU-007 en la numeración de sprint del equipo).
Refleja la implementación real del backend (rama `feature/Sprint_3_HU_007`) y su contrato
`docs/CONTRATO_FRONTEND_HU-3.1.md`. Lo marcado como **Pendiente para el backend** son
acuerdos del frontend que el backend todavía no cumple.

Última actualización: 2026-10-07.

## Origen de la información
- HU-3.1 y criterios CA-3.1.1, CA-3.1.2 y CA-3.1.3 (backlog Gherkin).
- HU-007 — Criterios de aceptación y especificaciones técnicas (Entrega 1, EPIC-003).
- Contrato del backend `docs/CONTRATO_FRONTEND_HU-3.1.md` y `QuizService.js`
  (rama `feature/Sprint_3_HU_007`, 2026-10-04).
- Tablas `quiz`, `quiz_mazo` y `pregunta_quiz` de `init.sql` (backend).
- Decisiones aceptadas durante el diseño de la historia (ver más abajo).

## Estado del backend (2026-10-07)
- `POST /api/v1/quizzes/generate` está implementado en la rama `feature/Sprint_3_HU_007`,
  **todavía no fusionada en `develop`**. Mientras no se fusione, el endpoint no existe en el
  backend de `develop` ni en su despliegue.
- La integración real del frontend se prueba cuando esa rama se fusione. El cliente
  (`quizzesApi.js`) llama siempre al backend real; no hay mocks.

## Endpoint
`POST /api/v1/quizzes/generate`

Nota de numeración: el CRUD genérico de `quizRoutes.js` (`POST /api/v1/quizzes`) no se usa
para esta historia; el endpoint oficial es `/quizzes/generate`.

## Autenticación y autorización
- Hoy el endpoint **no exige token ni rol docente** (así lo documenta el backend).
- `apiRequest` envía igualmente el header `Authorization` con el token de la sesión, por lo que
  no habrá cambios en el frontend cuando el backend proteja la ruta.
- El frontend muestra la pantalla solo a usuarios con rol docente (`RutaSoloDocente`), en la
  ruta `/docente/quices`.
- **Pendiente para el backend:** ver P1 en la sección «Pendientes para el backend».

## Decisiones aceptadas para esta historia
- Solo preguntas de **opción múltiple**: el enunciado es «¿Cuál es la traducción correcta de
  "palabra"?» y las opciones salen de `tarjeta.traduccion` (`VARCHAR(255)`).
- La variante «asociación término-definición» del CA-3.1.2 **no está implementada** (queda como
  trabajo futuro).
- El quiz se guarda con `estado: "programado"`. El estado «publicado» no se guarda ni hay tareas
  en segundo plano: el backend calcula `estado_efectivo` en cada consulta comparando
  `fecha_apertura` y `fecha_cierre` con la hora actual.
- Las fechas viajan en ISO 8601 con zona UTC (`toISOString()`).
- Se genera una pregunta por cada tarjeta aprobada, salvo que se indique `cantidad_preguntas`
  (decisión provisional, ver sección correspondiente).
- Los distractores salen de otras tarjetas `revisado_docente` de los mazos elegidos, sin repetir
  opciones (se comparan sin distinguir mayúsculas ni espacios).

## Cuerpo de la petición (request)

`Content-Type: application/json`

```json
{
  "curso_id": 1,
  "titulo": "Quiz acumulativo semanas 7-8",
  "mazo_ids": [5, 6],
  "fecha_apertura": "2026-10-12T20:00:00.000Z",
  "fecha_cierre": "2026-10-14T20:00:00.000Z",
  "tiempo_limite_min": 30,
  "cantidad_preguntas": 12
}
```

| Campo                | Tipo                   | Origen en el frontend                                  | Obligatorio | Destino en backend |
|----------------------|------------------------|---------------------------------------------------------|-------------|--------------------|
| `curso_id`           | number                 | Selector de cursos (`GET /api/v1/courses`)              | Sí          | `quiz.curso_id`    |
| `titulo`             | string (máx. 200)      | Formulario                                              | Sí          | `quiz.titulo`      |
| `mazo_ids`           | array de number        | Mazos del curso elegido (`GET /api/v1/decks`, filtrados por `curso_id`) | Sí | `quiz_mazo.mazo_id` (una fila por mazo) |
| `fecha_apertura`     | string (ISO 8601, UTC) | Formulario, convertida de hora local a UTC              | Sí          | `quiz.fecha_apertura` |
| `fecha_cierre`       | string (ISO 8601, UTC) | Formulario, convertida de hora local a UTC              | Sí          | `quiz.fecha_cierre` |
| `tiempo_limite_min`  | number (entero ≥ 1)    | Formulario                                              | Sí          | `quiz.tiempo_limite_min` |
| `cantidad_preguntas` | number (entero ≥ 1)    | Formulario (opcional)                                   | No          | Solo limita las preguntas generadas |

`cantidad_preguntas` **no se envía** cuando el campo del formulario queda vacío.

### Campos que el frontend NO envía
- `estado`: el backend lo asigna como `"programado"` (CA-3.1.3).
- `fecha_creacion`: la asigna el backend.
- `semana_corte`: el backend la calcula como la semana más alta entre los mazos elegidos.

### Validaciones del frontend (previas al envío)
- Un curso seleccionado y al menos un mazo de ese curso (al cambiar de curso se descartan los
  mazos elegidos).
- `titulo` no vacío y de máximo 200 caracteres.
- `fecha_apertura` posterior a la hora actual.
- `fecha_cierre` posterior a `fecha_apertura`.
- La ventana entre apertura y cierre, en minutos, debe ser mayor o igual que
  `tiempo_limite_min`; de lo contrario el quiz se cerraría antes de poder completarse.
- `tiempo_limite_min` entero y mayor o igual a 1.
- `cantidad_preguntas`, si se escribe, entero y mayor o igual a 1.

Estas validaciones son de usabilidad. El frontend muestra siempre el mensaje de error que
responda el backend.

## Respuesta exitosa (HTTP 201)

```json
{
  "quiz": {
    "id_quiz": 1,
    "curso_id": 1,
    "titulo": "Quiz acumulativo semanas 7-8",
    "semana_corte": 8,
    "fecha_creacion": "2026-10-07T15:36:39.843Z",
    "fecha_apertura": "2026-10-12T20:00:00.000Z",
    "fecha_cierre": "2026-10-14T20:00:00.000Z",
    "tiempo_limite_min": 30,
    "estado": "programado",
    "estado_efectivo": "programado"
  },
  "preguntas": [
    {
      "id_pregunta": 1,
      "quiz_id": 1,
      "tarjeta_id": 30,
      "tipo_pregunta": "seleccion_multiple",
      "enunciado": "¿Cuál es la traducción correcta de \"patchwork\"?",
      "opcion_a": "posibilidad",
      "opcion_b": "trabajo de retazos",
      "opcion_c": "pertenecer",
      "opcion_d": "isla",
      "respuesta_correcta": "trabajo de retazos",
      "orden": 1
    }
  ]
}
```

Qué hace el frontend con la respuesta:
- Muestra un mensaje de confirmación con el título, el número de preguntas y el
  `estado_efectivo`, y limpia el formulario.
- Muestra una **vista previa solo para la docente**: preguntas ordenadas por `orden`, con la
  respuesta correcta marcada con texto.
- **No pinta las opciones que vienen `null`.** Hoy una pregunta puede traer 2 o 3 opciones
  cuando hay pocas traducciones distintas (ver P2).
- Usa siempre `estado_efectivo`, nunca `estado`.
- `respuesta_correcta` viene en esta respuesta porque es la vista de la docente. Este payload no
  debe usarse para pintar el quiz del estudiante (HU-3.2).

## Errores

El backend responde `{ "error": "mensaje legible" }` con el código HTTP correspondiente. El
frontend muestra el mensaje tal cual, encima del botón «Generar Quiz».

| HTTP | Mensaje del backend (resumen)                                                     | Cuándo |
|------|------------------------------------------------------------------------------------|--------|
| 400  | `Los siguientes campos son obligatorios: …`                                        | Faltan campos |
| 400  | `fecha_apertura no es una fecha válida` / `fecha_cierre no es una fecha válida`    | Fecha no interpretable |
| 400  | `fecha_cierre debe ser posterior a fecha_apertura`                                 | Fechas invertidas o iguales |
| 400  | `tiempo_limite_min debe ser un número entero mayor o igual a 1`                    | Tiempo inválido |
| 400  | `cantidad_preguntas debe ser un número entero mayor o igual a 1`                   | Solo si se envía el campo |
| 400  | `mazo_ids debe contener solo ids de mazo (enteros mayores o iguales a 1)`          | Algún valor no es un id |
| 400  | `Se necesitan al menos 2 tarjetas en estado revisado_docente en los mazos seleccionados para generar un quiz` | Tarjetas aprobadas insuficientes (ver P2) |
| 404  | `El mazo N no existe`                                                              | Algún `mazo_id` no existe |
| 500  | (mensaje técnico)                                                                  | Error inesperado |

Manejo de errores de sesión (cuando el backend proteja la ruta): igual que
`ParticipacionMazo.jsx`, el frontend reconoce por el texto del mensaje «Token de autenticación
no proporcionado» o «Token inválido o expirado» (muestra aviso y cierra la sesión) y «No tiene
permisos para acceder a este recurso» (muestra aviso de rol insuficiente).

Limitación conocida: `apiRequest` (`httpClient.js`) no expone el código HTTP, solo el mensaje.
Por eso el frontend no distingue un 400 de un 422 ni muestra un mensaje genérico para el 500.
No es necesario modificar `httpClient.js` para esta historia.

## Estado del quiz (CA-3.1.3)

El backend guarda `estado: "programado"` y calcula `estado_efectivo` en cada consulta:

| `estado_efectivo` | Significa |
|-------------------|-----------|
| `programado`      | Todavía no llega `fecha_apertura` |
| `abierto`         | Entre apertura y cierre |
| `cerrado`         | Ya pasó `fecha_cierre` |

El frontend no consulta periódicamente para refrescarlo (se descartó el polling por los planes
gratuitos). En esta historia el estado se muestra solo en el mensaje posterior a la generación.

## Número de preguntas por quiz (decisión provisional)

**Regla actual (implementada en el backend):** una pregunta por cada tarjeta `revisado_docente`
de los mazos elegidos. Si se envía `cantidad_preguntas`, se toma una muestra aleatoria de esa
cantidad; si es mayor que las tarjetas disponibles, se usan todas.

**Estado:** provisional. Sujeta a cambio si la docente solicita otra regla.

**Compromiso del frontend:** no asume ningún número fijo de preguntas; muestra siempre las
preguntas recibidas.

## Pendientes para el backend 

Acuerdos del frontend que el backend aún no cumple. El frontend ya funciona sin ellos.

| #  | Pendiente | Estado actual del backend |
|----|-----------|---------------------------|
| P1 | Proteger `POST /quizzes/generate` con `authenticate` y `requireRole('docente')`, en una ruta que no exponga el CRUD genérico sin protección | Sin protección |
| P2 | Exigir al menos **4 traducciones distintas** (1 correcta + 3 distractores distintos) en lugar de 2 tarjetas, de modo que ninguna pregunta tenga menos de 4 opciones. El código HTTP (400 o 422) es indiferente para el frontend; se sugiere mantener 400 y ajustar el mensaje para indicar cuántas traducciones distintas se encontraron y cuántas se requieren | Mínimo de 2 tarjetas; hay preguntas con 2 o 3 opciones |
| P3 | Rechazar con 400 una solicitud en la que `fecha_cierre` menos `fecha_apertura`, en minutos, sea menor que `tiempo_limite_min` | Solo exige cierre posterior a apertura |
| P4 |  Validar que `curso_id` exista y que los mazos pertenezcan a ese curso | Solo valida que el mazo exista |
| P5 |  Rechazar con 400 un `titulo` de más de 200 caracteres | El servicio no lo valida; depende de la columna de la base de datos |

## Fuera del alcance de esta historia
- Variante «asociación término-definición» y «completar contexto».
- Listado y consulta de quices (`GET /quizzes`, `GET /quizzes/:id`): el backend los ofrece, pero
  este frontend no los usa todavía.
- Responder el quiz y calificarlo (HU-3.2).

## Historial de cambios respecto a la versión del 2026-10-04
- `mazos_ids` pasa a `mazo_ids`, el nombre real del backend.
- La respuesta pasa de un objeto plano con `total_preguntas` a `{ quiz, preguntas }`.
- El estado se lee de `estado_efectivo` (`programado`, `abierto`, `cerrado`).
- Se incluye `cantidad_preguntas` como campo opcional.
- El mínimo de tarjetas y la protección de la ruta pasan a ser pendientes (P1 y P2); el código de
  error por tarjetas insuficientes es 400, no 422.
- La validación de la ventana de tiempo pasa a ser pendiente del backend (P3); el frontend ya la
  aplica.

## Estado del backend (2026-10-08)
- `POST /api/v1/quizzes/generate` está fusionado en `develop` del backend y exige token y rol
  docente (`authenticate` y `requireRole('docente')`).
- El commit `6df73b9` del backend implementa los pendientes P2 a P5 (mínimo de 4 traducciones
  distintas, ventana de tiempo, validación de curso y mazos, longitud del título).
- Integración probada desde el frontend contra el backend local (`develop`, `6df73b9`):
  respuesta 201 con quiz programado y preguntas de 4 opciones, y respuesta 400 cuando hay menos de
  4 traducciones distintas. Los casos de P3 a P5 se aplican según el commit del backend y aún no se
  han probado desde la pantalla.
- El cliente (`quizzesApi.js`) llama siempre al backend real; no hay mocks.