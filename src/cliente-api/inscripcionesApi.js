/**
 * @file inscripcionesApi.js
 * @brief Cliente de inscripción de estudiantes a cursos (HU-5.3).
 */

import { apiRequest } from './httpClient';

/**
 * @brief HU-5.3.1: Inscribir un estudiante mediante código de acceso.
 * POST /api/v1/courses/enroll
 * @param {string} codigoAcceso - Código de acceso del curso entregado por la docente.
 * @param {number} estudianteId - Id del estudiante que se inscribe.
 * @return {Promise<Object>} La inscripción creada.
 */
export async function unirseCurso(codigoAcceso, estudianteId) {
  return apiRequest('/courses/enroll', {
    method: 'POST',
    body: JSON.stringify({
      estudiante_id: estudianteId,
      codigo_acceso: codigoAcceso,
    }),
  });
}

/**
 * @brief HU-5.3.2: Asignar directamente un estudiante a un curso mediante correo.
 * POST /api/v1/courses/:id/assign
 * @param {number} cursoId - Id del curso.
 * @param {string} email - Correo institucional del estudiante.
 * @return {Promise<Object>} La inscripción creada.
 */
export async function inscribirEstudiante(cursoId, email) {
  return apiRequest(`/courses/${cursoId}/assign`, {
    method: 'POST',
    body: JSON.stringify({
      email,
    }),
  });
}