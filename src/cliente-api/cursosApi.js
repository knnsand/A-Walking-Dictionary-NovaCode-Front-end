import { apiRequest } from './httpClient';

export async function listarCursos() {
  return apiRequest('/courses', {
    method: 'GET',
  });
}

export async function obtenerCurso(idCurso) {
  return apiRequest(`/courses/${idCurso}`, {
    method: 'GET',
  });
}

/**
 * Genera (o regenera) el código de acceso de un curso.
 * POST /api/v1/courses/:id/access-code -> { id_curso, codigo_acceso }
 */
export async function generarCodigoAcceso(idCurso) {
  return apiRequest(`/courses/${idCurso}/access-code`, {
    method: 'POST',
  });
}

/**
 * Estudiantes inscritos en un curso.
 * GET /api/v1/courses/:id/students -> [{ id_usuario, nombre_completo, nivel_ingles,
 * codigo_estudiantil, palabras_aportadas }]
 */
export async function listarEstudiantesCurso(idCurso) {
  return apiRequest(`/courses/${idCurso}/students`, {
    method: 'GET',
  });
}
