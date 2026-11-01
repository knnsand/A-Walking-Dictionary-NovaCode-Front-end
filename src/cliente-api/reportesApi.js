/**
 * @file reportesApi.js
 * @brief Reportes en PDF: progreso individual del estudiante (HU-018), reporte del modo de
 * estudio (HU-019), reporte de los estudiantes de un curso (HU-020) y resultados de un quiz
 * (HU-021).
 */

import { apiDescargarArchivo } from './httpClient';
import { USE_MOCK } from './apiConfig';
import {
  descargarProgresoMock,
  descargarReporteCursoMock,
  descargarModoEstudioMock,
  descargarResultadosQuizMock,
} from './mocks/reportesMock';

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
 * @brief HU-019: descarga el reporte del modo de estudio.
 *
 * La docente puede solicitar el reporte general sin student_id.
 * El estudiante solicita su reporte individual con student_id.
 *
 * GET /api/v1/reports/study-mode/export-pdf
 * GET /api/v1/reports/study-mode/export-pdf?student_id=:id
 *
 * @param {number|string|null} idEstudiante - ID opcional.
 * @return {Promise<void>} Se resuelve cuando inicia la descarga.
 * @throws {Error} Si el ID no es válido o el backend devuelve un error.
 */
export async function exportarReporteModoEstudioPdf(
  idEstudiante = null
) {
  // Sin ID: reporte general de estudio para la docente.
  const esReporteGeneral =
    idEstudiante === null || idEstudiante === undefined;

  const id = esReporteGeneral
    ? null
    : idValido(idEstudiante, 'Invalid student ID.');

  // Permite probar la descarga sin depender del backend.
  if (USE_MOCK) {
    return descargarModoEstudioMock(id);
  }

  // Construye la ruta según el tipo de reporte.
  const ruta = id
    ? `/reports/study-mode/export-pdf?student_id=${id}`
    : '/reports/study-mode/export-pdf';

  const nombreArchivo = id
    ? `study-mode-report-${id}.pdf`
    : 'study-mode-report-general.pdf';

  return apiDescargarArchivo(ruta, nombreArchivo);
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

/**
 * @brief HU-021: descarga el reporte de resultados de un quiz (calificación de cada estudiante,
 * «No presentó» y estadísticas del grupo). Solo docente. Usa un PDF de prueba si USE_MOCK está
 * activo.
 * GET /api/v1/reports/quizzes/:id/results/export-pdf
 * @note Contrato para el backend en docs/contrato-reporte-resultados-quiz.md.
 * @param {number|string} idQuiz - Id del quiz; debe ser un entero positivo.
 * @return {Promise<void>} Se resuelve cuando inicia la descarga.
 * @throws {Error} Si el id no es válido o el backend responde con error.
 */
export async function exportarResultadosQuizPdf(idQuiz) {
  const id = idValido(idQuiz, 'Invalid quiz ID.');

  if (USE_MOCK) {
    return descargarResultadosQuizMock(id);
  }

  return apiDescargarArchivo(
    `/reports/quizzes/${id}/results/export-pdf`,
    `quiz-results-${id}.pdf`,
  );
}
