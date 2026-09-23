import { apiRequest } from './httpClient';

/**
 * HU-5.3.1: Inscribir un estudiante mediante código de acceso.
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
 * HU-5.3.2: Asignar directamente un estudiante a un curso mediante correo.
 */
export async function inscribirEstudiante(cursoId, email) {
  return apiRequest(`/courses/${cursoId}/assign`, {
    method: 'POST',
    body: JSON.stringify({
      email,
    }),
  });
}