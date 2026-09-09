import { apiRequest } from './httpClient';
import { mockListarCitasPendientes, mockAprobarCita, mockDeclinarCita } from './mocks/citasMock';

// NOTA DE ALCANCE: ver comentario en citasMock.js. Este cliente API
// no tiene endpoint real definido en las especificaciones técnicas
// de HU-004/HU-005; las rutas de abajo son provisionales.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function listarCitasPendientes() {
  if (USE_MOCK) return Promise.resolve(mockListarCitasPendientes());
  return apiRequest('/quotes?estado=pendiente_revision');
}

export async function aprobarCita(idCita) {
  if (USE_MOCK) return Promise.resolve(mockAprobarCita(idCita));
  return apiRequest(`/quotes/${idCita}/approve`, { method: 'PATCH' });
}

export async function declinarCita(idCita) {
  if (USE_MOCK) return Promise.resolve(mockDeclinarCita(idCita));
  return apiRequest(`/quotes/${idCita}/decline`, { method: 'PATCH' });
}