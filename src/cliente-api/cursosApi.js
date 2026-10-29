/**
 * @file cursosApi.js
 * @brief Cliente de cursos: listado, detalle, código de acceso y estudiantes inscritos.
 */

import { apiRequest } from './httpClient';

/**
 * @brief Lista los cursos de la docente.
 * GET /api/v1/courses
 * @return {Promise<Object[]>} Cursos registrados.
 */
export async function listarCursos() {
  return apiRequest('/courses', {
    method: 'GET',
  });
}

/**
 * @brief Obtiene el detalle de un curso.
 * GET /api/v1/courses/:id
 * @param {number|string} idCurso - Id del curso.
 * @return {Promise<Object>} Datos del curso.
 */
export async function obtenerCurso(idCurso) {
  return apiRequest(`/courses/${idCurso}`, {
    method: 'GET',
  });
}

/**
 * @brief Genera (o regenera) el código de acceso de un curso.
 * POST /api/v1/courses/:id/access-code -> { id_curso, codigo_acceso }
 * @param {number|string} idCurso - Id del curso.
 * @return {Promise<{id_curso: number, codigo_acceso: string}>} El código generado.
 */
export async function generarCodigoAcceso(idCurso) {
  return apiRequest(`/courses/${idCurso}/access-code`, {
    method: 'POST',
  });
}

/**
 * @brief Estudiantes inscritos en un curso.
 * GET /api/v1/courses/:id/students -> [{ id_usuario, nombre_completo, nivel_ingles,
 * codigo_estudiantil, palabras_aportadas }]
 * @param {number|string} idCurso - Id del curso.
 * @return {Promise<Object[]>} Estudiantes inscritos.
 */
export async function listarEstudiantesCurso(idCurso) {
  return apiRequest(`/courses/${idCurso}/students`, {
    method: 'GET',
  });
}
