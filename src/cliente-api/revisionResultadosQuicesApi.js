
/**
 * @file revisionResultadosQuicesApi.js
 * @brief HU-022: cliente API para el panel docente de
 * revisión de resultados de quices.
 *
 * Reutiliza apiRequest para la autenticación JWT
 * y el manejo de errores HTTP.
 */

import { apiRequest } from './httpClient';

/**
 * @brief CA-22.2: obtiene los resultados individuales,
 * estadísticas generales y dificultad por pregunta.
 *
 * GET /api/v1/quizzes/:id/teacher-results
 *
 * @param {number|string} idQuiz - ID del quiz.
 * @return {Promise<Object>} Resumen de resultados.
 */
export async function obtenerResultadosQuizDocente(idQuiz) {
  return apiRequest(`/quizzes/${idQuiz}/teacher-results`);
}

/**
 * @brief CA-22.3: consulta las respuestas registradas
 * de un estudiante para un quiz determinado.
 *
 * GET /api/v1/quizzes/:id/teacher-results/:resultadoId
 *
 * @param {number|string} idQuiz - ID del quiz.
 * @param {number|string} resultadoId - ID del resultado.
 * @return {Promise<Object>} Detalle de respuestas.
 */
export async function obtenerRespuestasQuizDocente(
  idQuiz,
  resultadoId
) {
  return apiRequest(
    `/quizzes/${idQuiz}/teacher-results/${resultadoId}`
  );
}
