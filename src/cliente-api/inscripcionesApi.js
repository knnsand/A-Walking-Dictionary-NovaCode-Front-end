import { apiRequest } from './httpClient';
import { mockUnirseCurso, mockInscribirEstudiante } from './mocks/inscripcionesMock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * CA-5.3.1: inscribe al estudiante autenticado en el curso correspondiente a un código
 * de acceso.
 *
 * PENDIENTE DE VALIDAR CON EL EQUIPO: el campo "código de acceso" no existe todavía en
 * el esquema de base de datos (tabla curso, init.sql) ni existe ningún endpoint real para
 * esto. POST /api/v1/courses/enroll es un supuesto de contrato tomado de la descripción
 * original de la HU -- no se puede probar contra el backend real todavía. Se documentará
 * en docs/contrato-inscripcion.md.
 */
export async function unirseCurso(codigoAcceso, estudianteId) {
  if (USE_MOCK) {
  return Promise.resolve(mockUnirseCurso(codigoAcceso, estudianteId));
}
  return apiRequest('/courses/enroll', {
    method: 'POST',
    body: JSON.stringify({ codigo_acceso: codigoAcceso }),
  });
}

/**
 * CA-5.3.2: la docente inscribe directamente a un estudiante (por correo) en un curso.
 *
 * PENDIENTE DE VALIDAR CON EL EQUIPO: tampoco existe backend real para esto todavía.
 * Ver docs/contrato-inscripcion.md.
 */
export async function inscribirEstudiante(cursoId, email) {
  if (USE_MOCK) return Promise.resolve(mockInscribirEstudiante(cursoId, email));
  return apiRequest(`/courses/${cursoId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}