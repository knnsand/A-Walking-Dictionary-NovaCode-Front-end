import { apiRequest } from './httpClient';
import { cursosMock } from './mocks/cursosMock';
import { USE_MOCK } from './apiConfig';

export async function listarCursos() {
  if (USE_MOCK) {
    return cursosMock;
  }

  return apiRequest('/courses');
}
