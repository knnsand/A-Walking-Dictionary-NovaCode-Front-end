import { apiRequest } from './httpClient';
import { mockListarMazos, mockCrearMazo } from './mocks/mazosMock';
import { USE_MOCK } from './apiConfig';

export async function listarMazos() {
  if (USE_MOCK) {
    return mockListarMazos();
  }
  return apiRequest('/decks');
}

export async function crearMazo(datos) {
  if (USE_MOCK) {
    return mockCrearMazo(datos);
  }
  return apiRequest('/decks', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}