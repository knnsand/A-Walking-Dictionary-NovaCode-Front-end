import { apiRequest } from './httpClient';

export async function obtenerPerfil(estudianteId) {
  return apiRequest(`/users/${estudianteId}`, {
    method: 'GET',
  });
}

export async function actualizarPerfil(estudianteId, datos) {
  return apiRequest('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify({
      estudiante_id: estudianteId,
      nivel_ingles: datos.nivel_ingles,
      codigo_estudiantil: datos.codigo_estudiantil,
      avatar: datos.avatar,
      intereses: datos.intereses,
    }),
  });
}

export async function obtenerContextoAcademico(estudianteId) {
  return apiRequest(`/students/${estudianteId}/context`, {
    method: 'GET',
  });
}