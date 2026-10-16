# Contrato Frontend → Backend — quices del estudiante (HU-3.2 y lista de quices)

Documento del frontend para el backend (William). Lo que el frontend ya hace está en el PR #43
(`feature/HU-3.2-responder-quiz-front`). Aquí se piden los cambios que faltan para completar
CA-3.2.3 y para la lista de quices del estudiante, que implementará Manuela junto con HU-3.3.

Fecha: 2026-10-10. Base URL: `/api/v1`. Los nombres de ruta son una propuesta: si el backend
prefiere otros, basta con avisar y se ajusta el frontend.

## 1. Cómo funciona hoy el frontend

- Portada del quiz: `GET /quizzes/:id` (se usa `estado_efectivo`).
- Formulario: `GET /quizzes/:id/preguntas`, con cronómetro y envío con `POST /quizzes/:id/submit`.
- Resultado: nota, aciertos, errores, tiempo y detalle por pregunta (correcta, incorrecta o sin contestar).
- Ruta del estudiante: `/estudiante/quices/:idQuiz`.
- Reintento (CA-3.2.3): el resultado se **recuerda en el navegador** (`localStorage`, clave por
  estudiante) y, si no está, se obtiene con el `409` del submit. Es un respaldo temporal: solo
  funciona en el mismo navegador y el servidor no devuelve el resumen si el quiz ya cerró.

## 2. Qué se pide al backend

### 2.1 Lista de quices del estudiante — `GET /quizzes/mine` (necesario para la lista)

Hoy `GET /quizzes` devuelve **todos** los quices, sin token y sin filtro por curso.

- Requiere token con rol `estudiante`; el estudiante sale del token (como en `submit`).
- Devuelve solo los quices de los cursos donde el estudiante tiene inscripción activa.
- Orden: `fecha_apertura` descendente.
- Debe declararse **antes** de `GET /:id` en `quizRoutes.js`; si no, Express toma `mine` como un id.

Respuesta 200 (arreglo):

```json
[
  {
    "id_quiz": 1,
    "curso_id": 1,
    "titulo": "Quiz semanas 1-2",
    "semana_corte": 2,
    "fecha_apertura": "2026-10-09T18:00:00.000Z",
    "fecha_cierre": "2026-10-11T18:00:00.000Z",
    "tiempo_limite_min": 120,
    "estado": "programado",
    "estado_efectivo": "abierto",
    "resultado": null
  }
]
```

`resultado` es `null` si el estudiante no ha enviado el quiz; si ya lo envió:
`{ "id_resultado", "puntaje_obtenido", "puntaje_maximo", "calificacion", "fecha_envio" }`.

### 2.2 Resultado previo — `GET /quizzes/:id/result`

Para mostrar el resultado en cualquier dispositivo y aunque el quiz esté cerrado (CA-3.2.3).

- Requiere token con rol `estudiante`; el estudiante sale del token.
- **No** depende de que el quiz esté abierto.
- Respuesta 200: `{ "resultado": {...}, "respuestas": [...], "preguntas": [...] }`, con
  `resultado` y `respuestas` iguales a los del submit. `preguntas` trae
  `id_pregunta`, `enunciado`, `opcion_a` a `opcion_d` y `orden`, **sin** `respuesta_correcta`
  ni `tarjeta_id`. Así el detalle por pregunta se puede mostrar sin consultar
  `GET /:id/preguntas`, que solo responde con el quiz abierto.
- Respuesta 404 si todavía no envió: `{ "error": "Aún no has enviado este quiz" }`.

### 2.3 Seguridad (hallazgo para la auditoría OWASP)

Hoy las siguientes rutas de `quizRoutes.js` no piden token:

| Ruta | Pedido |
|---|---|
| `POST /quizzes`, `PUT /quizzes/:id`, `DELETE /quizzes/:id` | `authenticate` + `requireRole('docente')` |
| `GET /quizzes`, `GET /quizzes/:id` | `authenticate` (cualquier rol; la portada del estudiante usa `GET /:id`) |

Cualquier persona, incluso sin sesión, puede hoy modificar o borrar un quiz.

## 3. Decisiones pendientes con la docente

- **Escala de la calificación:** el contrato la supone de 0.0 a 5.0. El frontend no escribe "sobre 5.0"
  hasta que se confirme.
- **Respuesta correcta en el detalle:** hoy no se muestra. Si la docente quiere mostrarla, se
  recomienda hacerlo solo cuando `estado_efectivo` sea `cerrado`, para que no circule mientras
  otros estudiantes aún responden. Requeriría incluirla en `GET /:id/result`.
- **Un curso o varios:** el frontend no filtra por curso. Si es un solo curso, 2.1 igual sirve.

## 4. Límites conocidos que no se piden ahora

- `fecha_inicio` la informa el cliente, por lo que el límite de tiempo no es inviolable
  (aceptado por el equipo el 2026-10-07). La alternativa sería un `POST /quizzes/:id/start`
  que registre el inicio en el servidor.
- El autoenvío por tiempo solo ocurre con la pestaña abierta.

## 5. Qué cambia en el frontend cuando existan 2.1 y 2.2

- La lista usará `GET /quizzes/mine` y mostrará la nota de los quices ya enviados.
- El contenedor `ResponderQuiz` consultará `GET /quizzes/:id/result` antes de mostrar la
  portada. El respaldo del navegador quedaría solo para cuando ese endpoint falle.

## 6. Cómo verificarlo

1. Estudiante inscrito: `GET /quizzes/mine` devuelve solo sus quices; `resultado` es `null` antes de enviar.
2. Tras enviar, `resultado` trae la nota y `GET /quizzes/:id/result` devuelve el detalle.
3. Con el quiz cerrado, `GET /quizzes/:id/result` sigue respondiendo `200` al estudiante que envió.
4. Sin enviar, `GET /quizzes/:id/result` responde `404`.
5. Sin token, `PUT` y `DELETE` en `/quizzes/:id` responden `401`.