import { apiRequest } from './httpClient';
import { cursosMock } from './mocks/cursosMock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function listarCursos() {
  if (USE_MOCK) {
    return Promise.resolve(cursosMock);
  }
  return apiRequest('/courses');
}