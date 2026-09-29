import { apiRequest } from './httpClient';

export async function obtenerPerfil(estudianteId) {
  return apiRequest(`/users/${estudianteId}`, {
    method: 'GET',
  });
}

export async function actualizarPerfil(datos) {
  return apiRequest('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify({
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