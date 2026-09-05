import { apiRequest } from './httpClient';
import { mockListarMazos, mockCrearMazo } from './mocks/mazosMock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function listarMazos() {
  if (USE_MOCK) {
    return Promise.resolve(mockListarMazos());
  }
  return apiRequest('/decks');
}

export async function crearMazo(datos) {
  if (USE_MOCK) {
    return Promise.resolve(mockCrearMazo(datos));
  }
  return apiRequest('/decks', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}