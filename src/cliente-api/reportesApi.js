/**
 * @file reportesApi.js
 * @brief HU-018: Reporte de progreso individual del estudiante.
 */

import { apiDescargarArchivo } from './httpClient';
import { USE_MOCK } from './apiConfig';
import { descargarProgresoMock } from './mocks/reportesMock';

/**
 * @brief Descarga el PDF de progreso individual de un estudiante (palabras aportadas,
 * resultados de quices y progreso de estudio). Usa un PDF de prueba si USE_MOCK está activo.
 * GET /api/v1/reports/students/:id/progress/export-pdf
 * @param {number|string} idEstudiante - Id del estudiante; debe ser un entero positivo.
 * @return {Promise<void>} Se resuelve cuando inicia la descarga.
 * @throws {Error} Si el id no es válido o el backend responde con error.
 */
export async function exportarProgresoEstudiantePdf(idEstudiante) {
  const id = String(idEstudiante ?? '');

  // Verificar que el ID sea un entero positivo.
  if (!/^[1-9]\d*$/.test(id)) {
    throw new Error('Invalid student ID.');
  }

  // Si los mocks están activos, descargar un PDF de prueba.
  if (USE_MOCK) {
    return descargarProgresoMock(id);
  }

  // Si los mocks están desactivados, llamar al backend.
  return apiDescargarArchivo(
    `/reports/students/${id}/progress/export-pdf`,
    `student-progress-${id}.pdf`,
  );
}
