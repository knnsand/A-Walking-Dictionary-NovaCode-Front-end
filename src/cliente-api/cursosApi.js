import { apiRequest } from './httpClient';

export async function listarCursos() {
  return apiRequest('/courses', {
    method: 'GET',
  });
}