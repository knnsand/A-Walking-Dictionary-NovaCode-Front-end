/**
 * @file quizzesApi.js
 * @brief Cliente para HU-3.1 (generar quices acumulativos).
 * Fuentes: docs/contrato-quiz.md (frontend) y docs/CONTRATO_FRONTEND_HU-3.1.md
 * (backend, rama feature/Sprint_3_HU_007).
 *
 * Auth: `apiRequest` (httpClient.js) ya agrega el header Authorization con el
 * token guardado en localStorage, así que aquí no se maneja el token.
 */

import { apiRequest } from './httpClient';

/**
 * @brief Genera un quiz acumulativo a partir de las tarjetas `revisado_docente` de los
 * mazos elegidos y lo guarda en estado `programado` (CA-3.1.1, CA-3.1.2, CA-3.1.3).
 * POST /api/v1/quizzes/generate
 *
 * @param {Object} datos
 * @param {number} datos.curso_id
 * @param {string} datos.titulo - máximo 200 caracteres.
 * @param {number[]} datos.mazo_ids - ids de mazo; al menos uno.
 * @param {string} datos.fecha_apertura - ISO 8601 en UTC (toISOString()).
 * @param {string} datos.fecha_cierre - ISO 8601 en UTC; posterior a la apertura.
 * @param {number} datos.tiempo_limite_min - entero >= 1.
 * @param {number} [datos.cantidad_preguntas] - entero >= 1; si no se envía, el
 *   backend genera una pregunta por cada tarjeta aprobada.
 * @return {Promise<{
 *   quiz: {
 *     id_quiz: number, curso_id: number, titulo: string, semana_corte: number,
 *     fecha_creacion: string, fecha_apertura: string, fecha_cierre: string,
 *     tiempo_limite_min: number, estado: string, estado_efectivo: string
 *   },
 *   preguntas: Array<{
 *     id_pregunta: number, quiz_id: number, tarjeta_id: number,
 *     tipo_pregunta: string, enunciado: string,
 *     opcion_a: string, opcion_b: string,
 *     opcion_c: string|null, opcion_d: string|null,
 *     respuesta_correcta: string, orden: number
 *   }>
 * }>}
 * @throws {Error} con `.message` listo para mostrar al usuario (400 datos
 *   inválidos o tarjetas insuficientes, 404 mazo inexistente, 500 error interno).
 */
export async function generarQuiz(datos) {
  return apiRequest('/quizzes/generate', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

/**
 * @brief Lista todos los quices generados, cada uno con `estado_efectivo` calculado
 * (CA-3.1.3). Lo usa la lista compartida de quices (vistas/quices/ListaQuices):
 * la docente la ve bajo el formulario y exporta el PDF de cualquiera, aunque ya
 * haya recargado la página (CA-3.3.2); el estudiante la ve en /estudiante/quices.
 * GET /api/v1/quizzes
 *
 * El backend devuelve los quices de todos los cursos, sin orden garantizado.
 * Cuando exista GET /quizzes/mine (docs/contrato-quiz-estudiante.md, 2.1), el
 * estudiante usará una función propia y esta quedará para la docente.
 *
 * @return {Promise<Array<{
 *   id_quiz: number, curso_id: number, titulo: string, semana_corte: number,
 *   fecha_creacion: string, fecha_apertura: string, fecha_cierre: string,
 *   tiempo_limite_min: number, estado: string, estado_efectivo: string
 * }>>}
 * @throws {Error} con `.message` listo para mostrar al usuario.
 */
export async function listarQuices() {
  return apiRequest('/quizzes');
}


/**
 * @brief Obtiene las preguntas de un quiz para el estudiante, sin `respuesta_correcta`
 * ni `tarjeta_id` (HU-3.2). Solo responde mientras el quiz está abierto.
 * GET /api/v1/quizzes/:id/preguntas
 * Fuente: CONTRATO_FRONTEND_HU-3.2.md (backend, rama feature/Sprint_3_HU_008).
 *
 * @param {number|string} idQuiz - Id del quiz.
 * @return {Promise<{
 *   quiz: {
 *     id_quiz: number, titulo: string, tiempo_limite_min: number,
 *     fecha_apertura: string, fecha_cierre: string,
 *     estado: string, estado_efectivo: string
 *   },
 *   preguntas: Array<{
 *     id_pregunta: number, tipo_pregunta: string, enunciado: string,
 *     opcion_a: string, opcion_b: string,
 *     opcion_c: string|null, opcion_d: string|null, orden: number
 *   }>
 * }>}
 * @throws {Error} con `.message` listo para mostrar (401, 403, 404 o 400 si el
 *   quiz aún no abre o ya cerró). El error trae además `.status` y `.cuerpo`.
 */
export async function obtenerPreguntasQuiz(idQuiz) {
  return apiRequest(`/quizzes/${idQuiz}/preguntas`);
}

/**
 * @brief Envía las respuestas del estudiante, el backend las califica y las guarda
 * (CA-3.2.1, CA-3.2.2, CA-3.2.3). Cada estudiante puede enviar una sola vez.
 * POST /api/v1/quizzes/:id/submit
 *
 * Un `409` (el quiz ya se había enviado) NO se trata como error: el backend
 * devuelve el resumen del intento anterior y se entrega igual, con
 * `yaEnviado: true`, para mostrarlo como pantalla de resultado (CA-3.2.3).
 *
 * @param {number|string} idQuiz - Id del quiz.
 * @param {Object} datos
 * @param {string} datos.fecha_inicio - ISO 8601 (toISOString()); el backend lo
 *   usa para validar el tiempo límite.
 * @param {Array<{pregunta_id: number, respuesta_estudiante: string|null}>} datos.respuestas
 *   - `respuesta_estudiante` es el texto exacto de la opción elegida, no la letra.
 * @return {Promise<{
 *   resultado: {
 *     id_resultado: number, quiz_id: number, estudiante_id: number,
 *     fecha_inicio: string, fecha_envio: string,
 *     puntaje_obtenido: number, puntaje_maximo: number,
 *     calificacion: number, tiempo_empleado_seg: number
 *   },
 *   respuestas: Array<{
 *     id_respuesta: number, resultado_id: number, pregunta_id: number,
 *     respuesta_estudiante: string|null, es_correcta: boolean,
 *     puntaje_obtenido: number
 *   }>,
 *   yaEnviado: boolean
 * }>}
 * @throws {Error} con `.message` listo para mostrar (401, 403, 404, 400 por
 *   quiz cerrado o tiempo agotado, 500). El error trae `.status` y `.cuerpo`.
 */
export async function enviarRespuestasQuiz(idQuiz, datos) {
  try {
    const cuerpo = await apiRequest(`/quizzes/${idQuiz}/submit`, {
      method: 'POST',
      body: JSON.stringify(datos),
    });
    return { resultado: cuerpo.resultado, respuestas: cuerpo.respuestas, yaEnviado: false };
  } catch (error) {
    if (error.status === 409 && error.cuerpo?.resultado) {
      return {
        resultado: error.cuerpo.resultado,
        respuestas: error.cuerpo.respuestas ?? [],
        yaEnviado: true,
      };
    }
    throw error;
  }
}


/**
 * @brief Obtiene un quiz con su `estado_efectivo` calculado, para la portada del quiz (HU-3.2).
 * GET /api/v1/quizzes/:id
 * No incluye preguntas (para eso, `obtenerPreguntasQuiz`).
 * Fuente: CONTRATO_FRONTEND_HU-3.1.md (backend), sección "Endpoints de apoyo".
 *
 * Usar siempre `estado_efectivo` ("programado" | "abierto" | "cerrado"), nunca `estado`.
 *
 * @param {number|string} idQuiz - Id del quiz.
 * @return {Promise<{
 *   id_quiz: number, curso_id: number, titulo: string, semana_corte: number,
 *   fecha_creacion: string, fecha_apertura: string, fecha_cierre: string,
 *   tiempo_limite_min: number, estado: string, estado_efectivo: string
 * }>}
 * @throws {Error} con `.message` listo para mostrar (400 id inválido, 404 quiz no encontrado).
 */
export async function obtenerQuiz(idQuiz) {
  return apiRequest(`/quizzes/${idQuiz}`);
}
