/**
 * @file reportesApi.js
 * @brief Reportes en PDF: progreso individual del estudiante (HU-018) y reporte de los
 * estudiantes de un curso (HU-020).
 */

import { apiDescargarArchivo } from './httpClient';
import { USE_MOCK } from './apiConfig';
import { descargarProgresoMock, descargarReporteCursoMock } from './mocks/reportesMock';

/**
 * @brief Convierte un id en texto y verifica que sea un entero positivo.
 * @param {number|string} valor - Id recibido.
 * @param {string} mensaje - Mensaje del error si el id no es válido.
 * @return {string} El id como texto.
 * @throws {Error} Si el id no es un entero positivo.
 */
function idValido(valor, mensaje) {
  const id = String(valor ?? '');
  if (!/^[1-9]\d*$/.test(id)) {
    throw new Error(mensaje);
  }
  return id;
}

/**
 * @brief Descarga el PDF de progreso individual de un estudiante (palabras aportadas,
 * resultados de quices y progreso de estudio). Usa un PDF de prueba si USE_MOCK está activo.
 * GET /api/v1/reports/students/:id/progress/export-pdf
 * @param {number|string} idEstudiante - Id del estudiante; debe ser un entero positivo.
 * @return {Promise<void>} Se resuelve cuando inicia la descarga.
 * @throws {Error} Si el id no es válido o el backend responde con error.
 */
export async function exportarProgresoEstudiantePdf(idEstudiante) {
  const id = idValido(idEstudiante, 'Invalid student ID.');

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

/**
 * @brief HU-020: descarga el reporte consolidado de los estudiantes de un curso (palabras
 * añadidas, notas de los quices y participación de cada uno). Solo docente. Usa un PDF de
 * prueba si USE_MOCK está activo.
 * GET /api/v1/reports/students/export-pdf?curso_id=:id
 * @note El parámetro `curso_id` es una propuesta del frontend pendiente de validar con el
 * backend (ver docs/contrato-reporte-curso.md).
 * @param {number|string} idCurso - Id del curso; debe ser un entero positivo.
 * @return {Promise<void>} Se resuelve cuando inicia la descarga.
 * @throws {Error} Si el id no es válido o el backend responde con error.
 */
export async function exportarReporteCursoPdf(idCurso) {
  const id = idValido(idCurso, 'Invalid course ID.');

  if (USE_MOCK) {
    return descargarReporteCursoMock(id);
  }

  return apiDescargarArchivo(
    `/reports/students/export-pdf?curso_id=${id}`,
    `course-report-${id}.pdf`,
  );
}
