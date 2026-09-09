import { apiRequest } from './httpClient';
import { mockListarMazos, mockCrearMazo, mockActualizarEstadoMazo} from './mocks/mazosMock';
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

export async function actualizarEstadoMazo(idMazo, estado) {
  if (USE_MOCK) {
    return mockActualizarEstadoMazo(idMazo, estado);
  }

  return apiRequest(`/decks/${idMazo}`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}