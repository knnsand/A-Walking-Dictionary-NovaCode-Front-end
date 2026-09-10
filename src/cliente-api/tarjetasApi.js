import { apiRequest } from './httpClient';
import {
  mockListarPendientes,
  mockAprobarTarjeta,
  mockRechazarTarjeta,
  mockActualizarContexto,
  mockListarAprobadas,
  mockRegistrarTarjeta,
  mockVerificarDuplicado,
} from './mocks/tarjetasMock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** HU-004: lista tarjetas en estado pendiente_revision. */
export async function listarTarjetasPendientes() {
  if (USE_MOCK) return Promise.resolve(mockListarPendientes());
  return apiRequest('/cards?estado=pendiente_revision');
}

/** HU-004: aprueba una tarjeta, con correcciones opcionales del docente. */
export async function aprobarTarjeta(cardId, datosEditados = {}) {
  if (USE_MOCK) return Promise.resolve(mockAprobarTarjeta(cardId, datosEditados));
  return apiRequest(`/cards/${cardId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(datosEditados),
  });
}

/** Rechaza una tarjeta pendiente (mostrado en el mockup como "Rechazar"). */
export async function rechazarTarjeta(cardId) {
  if (USE_MOCK) return Promise.resolve(mockRechazarTarjeta(cardId));
  return apiRequest(`/cards/${cardId}/reject`, { method: 'PATCH' });
}

/** HU-005: asigna registro y variante regional a una tarjeta. */
export async function actualizarContextoTarjeta(cardId, contexto) {
  if (USE_MOCK) return Promise.resolve(mockActualizarContexto(cardId, contexto));
  return apiRequest(`/cards/${cardId}/context`, {
    method: 'PUT',
    body: JSON.stringify(contexto),
  });
}

/** Pestaña "Historial Aprobadas": tarjetas ya validadas por la docente. */
export async function listarTarjetasAprobadas() {
  if (USE_MOCK) return Promise.resolve(mockListarAprobadas());
  return apiRequest('/cards?estado=revisado_docente');
}

/**
 * HU-002: registra una palabra nueva dentro de un mazo.
 *
 * El id del mazo viaja en la URL y los datos de la tarjeta en el body.
 */
export async function registrarTarjeta(idMazo, datos) {
  if (USE_MOCK) {
    return Promise.resolve(mockRegistrarTarjeta(idMazo, datos));
  }

  return apiRequest(`/decks/${idMazo}/cards`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

/**
 * HU-002 / HU-003: verifica si una palabra ya existe en el mazo
 * antes de confirmar el registro.
 */
export async function verificarDuplicado(
  mazoId,
  palabra,
  definicion,
  ejemplo
) {
  if (USE_MOCK) {
    return Promise.resolve(
      mockVerificarDuplicado(mazoId, palabra, definicion, ejemplo)
    );
  }

  return apiRequest('/cards/check-duplicate', {
    method: 'POST',
    body: JSON.stringify({
      mazo_id: mazoId,
      palabra,
      definicion,
      ejemplo,
    }),
  });
}