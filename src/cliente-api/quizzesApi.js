/**
 * quizzesApi.js
 * Cliente para HU-3.1 (generar quices acumulativos).
 * Fuentes: docs/contrato-quiz.md (frontend) y docs/CONTRATO_FRONTEND_HU-3.1.md
 * (backend, rama feature/Sprint_3_HU_007).
 *
 * Auth: `apiRequest` (httpClient.js) ya agrega el header Authorization con el
 * token guardado en localStorage, así que aquí no se maneja el token.
 */

import { apiRequest } from './httpClient';

/**
 * Genera un quiz acumulativo a partir de las tarjetas `revisado_docente` de los
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
 * @returns {Promise<{
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
 * Lista todos los quices generados, cada uno con `estado_efectivo` calculado
 * (CA-3.1.3). Lo usa HU-3.3 para que la docente elija un quiz existente y
 * exporte su PDF aunque ya haya recargado la página (CA-3.3.2).
 * GET /api/v1/quizzes
 *
 * El backend devuelve los quices de todos los cursos, sin orden garantizado.
 *
 * @returns {Promise<Array<{
 *   id_quiz: number, curso_id: number, titulo: string, semana_corte: number,
 *   fecha_creacion: string, fecha_apertura: string, fecha_cierre: string,
 *   tiempo_limite_min: number, estado: string, estado_efectivo: string
 * }>>}
 * @throws {Error} con `.message` listo para mostrar al usuario.
 */
export async function listarQuices() {
  return apiRequest('/quizzes');
}
