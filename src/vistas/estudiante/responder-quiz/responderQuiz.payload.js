/**
 * @file responderQuiz.payload.js
 * @brief HU-3.2: cálculos sobre las preguntas y las respuestas del estudiante.
 * Funciones puras, sin interfaz. Contrato: CONTRATO_FRONTEND_HU-3.2.md (backend).
 */

/** @brief Columnas de las opciones de una pregunta, en orden. */
const CAMPOS_OPCION = ['opcion_a', 'opcion_b', 'opcion_c', 'opcion_d'];

/**
 * @brief Textos de las opciones de una pregunta, en el orden opcion_a -> opcion_d.
 * Se omiten las que vienen null (el contrato indica que se pueden omitir).
 * @param {Object} pregunta - Pregunta del quiz.
 * @return {string[]}
 */
export function opcionesDePregunta(pregunta) {
  return CAMPOS_OPCION.map((campo) => pregunta[campo]).filter((texto) => texto != null);
}

/**
 * @brief Copia de las preguntas ordenada por `orden`, sin modificar el arreglo original.
 * @param {Array} preguntas - Preguntas del quiz.
 * @return {Array}
 */
export function ordenarPreguntas(preguntas) {
  return [...preguntas].sort((a, b) => a.orden - b.orden);
}

/**
 * @brief Respuesta válida de una pregunta o null. Solo cuenta como contestada si es el
 * texto exacto de una de sus opciones: así nunca se envía una letra ni un valor
 * viejo que ya no corresponda (por ejemplo, de un borrador desactualizado).
 * @param {Object} pregunta - Pregunta del quiz.
 * @param {Object<string, string>} respuestas - { [id_pregunta]: texto de la opción }.
 * @return {string|null}
 */
function respuestaElegida(pregunta, respuestas) {
  const elegida = respuestas?.[pregunta.id_pregunta];
  return opcionesDePregunta(pregunta).includes(elegida) ? elegida : null;
}

/**
 * @brief Cuerpo del POST /quizzes/:id/submit. Incluye una entrada por cada pregunta del
 * quiz; las no contestadas van con `respuesta_estudiante: null` y el backend las
 * cuenta como incorrectas.
 *
 * @param {Object} datos
 * @param {string} datos.fechaInicio - ISO 8601 del momento en que se pulsó "Iniciar".
 * @param {Array}  datos.preguntas   - Respuesta de GET /quizzes/:id/preguntas.
 * @param {Object<string, string>} datos.respuestas - { [id_pregunta]: texto de la opción }.
 * @return {{ fecha_inicio: string,
 *   respuestas: Array<{ pregunta_id: number, respuesta_estudiante: string|null }> }}
 */
export function construirPayloadEnvio({ fechaInicio, preguntas, respuestas }) {
  return {
    fecha_inicio: fechaInicio,
    respuestas: preguntas.map((pregunta) => ({
      pregunta_id: pregunta.id_pregunta,
      respuesta_estudiante: respuestaElegida(pregunta, respuestas),
    })),
  };
}

/**
 * @brief Cantidad de preguntas sin contestar, para pedir confirmación antes de
 * "Finalizar examen" si faltan (CONTRATO_FRONTEND_HU-3.2.md, sección Temporizador).
 * @param {Object} datos
 * @param {Array} datos.preguntas - Preguntas del quiz.
 * @param {Object<string, string>} datos.respuestas - { [id_pregunta]: texto de la opción }.
 * @return {number}
 */
export function contarSinContestar({ preguntas, respuestas }) {
  return preguntas.filter((pregunta) => respuestaElegida(pregunta, respuestas) === null).length;
}