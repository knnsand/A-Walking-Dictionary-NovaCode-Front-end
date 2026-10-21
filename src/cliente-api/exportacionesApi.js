/**
 * exportacionesApi.js
 * Cliente para HU-3.3 (HU-009 en la numeración de sprint): exportar mazos y
 * quices a PDF.
 * Fuente: docs/contrato-exportacion.md (frontend) y
 * docs/CONTRATO_FRONTEND_HU-3.3.md (backend).
 *
 * Los dos endpoints devuelven el archivo PDF directamente (no JSON), exigen
 * token de un usuario con rol docente y devuelven errores en JSON.
 */

import { apiDescargarArchivo } from './httpClient';
import { USE_MOCK } from './apiConfig';

const MENSAJE_MOCK =
  'La exportación a PDF no está disponible con datos simulados (VITE_USE_MOCK=true).';

/**
 * Descarga el PDF del mazo con sus tarjetas aprobadas por la docente (CA-3.3.1, CA-3.3.3).
 * GET /api/v1/decks/:id/export-pdf
 *
 * @param {number|string} idMazo
 * @throws {Error} con `.message` listo para mostrar al usuario.
 */
export async function exportarMazoPdf(idMazo) {
  if (USE_MOCK) {
    throw new Error(MENSAJE_MOCK);
  }
  return apiDescargarArchivo(`/decks/${idMazo}/export-pdf`, `mazo-${idMazo}.pdf`);
}

/**
 * Descarga el PDF imprimible del quiz: hoja de preguntas y, en página aparte,
 * la hoja de respuestas para la docente (CA-3.3.2, CA-3.3.3).
 * GET /api/v1/quizzes/:id/export-pdf
 *
 * @param {number|string} idQuiz
 * @throws {Error} con `.message` listo para mostrar al usuario.
 */
export async function exportarQuizPdf(idQuiz) {
  if (USE_MOCK) {
    throw new Error(MENSAJE_MOCK);
  }
  return apiDescargarArchivo(`/quizzes/${idQuiz}/export-pdf`, `quiz-${idQuiz}.pdf`);
}
