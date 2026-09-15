import { apiRequest } from './httpClient';
import {
  mockListarPendientes,
  mockAprobarTarjeta,
  mockEditarTarjeta,
  mockRechazarTarjeta,
  mockActualizarContexto,
  mockListarAprobadas,
  mockRegistrarTarjeta,
  mockVerificarDuplicado,
} from './mocks/tarjetasMock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** HU-004 (CA-2.1.1): lista tarjetas en estado pendiente_revision. */
export async function listarTarjetasPendientes() {
  if (USE_MOCK) return Promise.resolve(mockListarPendientes());
  return apiRequest('/cards/pending');
}

/**
 * HU-004 (CA-2.1.2, paso "editar/corregir"): guarda correcciones sobre una tarjeta que
 * todavía está pendiente de revisión. Debe llamarse ANTES de aprobarTarjeta(): el backend
 * exige que la tarjeta siga en 'pendiente_revision' para aceptar la edición.
 */
export async function editarTarjeta(cardId, datos) {
  if (USE_MOCK) return Promise.resolve(mockEditarTarjeta(cardId, datos));
  return apiRequest(`/cards/${cardId}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

/**
 * HU-004 (CA-2.1.2, paso "aprobar"): aprueba una tarjeta pendiente.
 *
 * El backend (PATCH /cards/:id/approve) no lee el body de esta petición -- cualquier
 * corrección debe guardarse antes con editarTarjeta().
 */
export async function aprobarTarjeta(cardId) {
  if (USE_MOCK) return Promise.resolve(mockAprobarTarjeta(cardId));
  return apiRequest(`/cards/${cardId}/approve`, { method: 'PATCH' });
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