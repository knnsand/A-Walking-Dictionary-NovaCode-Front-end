import { apiRequest } from './httpClient';
import { mockObtenerPerfil, mockActualizarPerfil, mockObtenerContextoAcademico } from './mocks/perfilMock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function obtenerPerfil(estudianteId) {
  if (USE_MOCK) return Promise.resolve(mockObtenerPerfil(estudianteId));
  // PENDIENTE DE VALIDAR: no existe endpoint real de lectura de perfil todavía
  // (usuarioRoutes.js tiene GET /:id pero no está montado en app.js).
  return apiRequest(`/users/${estudianteId}`, { method: 'GET' });
}

export async function actualizarPerfil(estudianteId, datos) {
  if (USE_MOCK) return Promise.resolve(mockActualizarPerfil(estudianteId, datos));
  return apiRequest('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify({ estudiante_id: estudianteId, ...datos }),
  });
}

export async function obtenerContextoAcademico(estudianteId) {
  if (USE_MOCK) return Promise.resolve(mockObtenerContextoAcademico(estudianteId));
  // PENDIENTE: no existe ningún endpoint real que agregue esta información todavía.
  return apiRequest(`/students/${estudianteId}/context`, { method: 'GET' });
}