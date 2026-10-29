/**
 * @file tarjetasApi.js
 * @brief Cliente de tarjetas de vocabulario: registro, duplicados, revisión docente y contexto.
 */

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

/**
 * @brief HU-004 (CA-2.1.1): lista tarjetas en estado pendiente_revision.
 * GET /api/v1/cards/pending
 * @return {Promise<Object[]>} Tarjetas pendientes de revisión.
 */
export async function listarTarjetasPendientes() {
  if (USE_MOCK) return Promise.resolve(mockListarPendientes());
  return apiRequest('/cards/pending');
}

/**
 * @brief HU-004 (CA-2.1.2, paso "editar/corregir"): guarda correcciones sobre una tarjeta que
 * todavía está pendiente de revisión. Debe llamarse ANTES de aprobarTarjeta(): el backend
 * exige que la tarjeta siga en 'pendiente_revision' para aceptar la edición.
 * PUT /api/v1/cards/:id
 * @param {number} cardId - Id de la tarjeta.
 * @param {Object} datos - Campos corregidos de la tarjeta.
 * @return {Promise<Object>} La tarjeta actualizada.
 */
export async function editarTarjeta(cardId, datos) {
  if (USE_MOCK) return Promise.resolve(mockEditarTarjeta(cardId, datos));
  return apiRequest(`/cards/${cardId}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

/**
 * @brief HU-004 (CA-2.1.2, paso "aprobar"): aprueba una tarjeta pendiente.
 *
 * El backend (PATCH /cards/:id/approve) no lee el body de esta petición -- cualquier
 * corrección debe guardarse antes con editarTarjeta().
 * @param {number} cardId - Id de la tarjeta.
 * @return {Promise<Object>} La tarjeta aprobada.
 */
export async function aprobarTarjeta(cardId) {
  if (USE_MOCK) return Promise.resolve(mockAprobarTarjeta(cardId));
  return apiRequest(`/cards/${cardId}/approve`, { method: 'PATCH' });
}

/**
 * @brief Rechaza una tarjeta pendiente (mostrado en el mockup como "Rechazar").
 * PATCH /api/v1/cards/:id/reject
 * @param {number} cardId - Id de la tarjeta.
 * @return {Promise<Object>} La tarjeta rechazada.
 */
export async function rechazarTarjeta(cardId) {
  if (USE_MOCK) return Promise.resolve(mockRechazarTarjeta(cardId));
  return apiRequest(`/cards/${cardId}/reject`, { method: 'PATCH' });
}

/**
 * @brief HU-005: asigna registro y variante regional a una tarjeta.
 * PUT /api/v1/cards/:id/context
 * @param {number} cardId - Id de la tarjeta.
 * @param {Object} contexto - Registro y variante regional a asignar.
 * @return {Promise<Object>} La tarjeta con su contexto actualizado.
 */
export async function actualizarContextoTarjeta(cardId, contexto) {
  if (USE_MOCK) return Promise.resolve(mockActualizarContexto(cardId, contexto));
  return apiRequest(`/cards/${cardId}/context`, {
    method: 'PUT',
    body: JSON.stringify(contexto),
  });
}

/**
 * @brief Pestaña "Historial Aprobadas": tarjetas ya validadas por la docente.
 * GET /api/v1/cards/approved
 * @return {Promise<Object[]>} Tarjetas aprobadas.
 */
export async function listarTarjetasAprobadas() {
  if (USE_MOCK) return Promise.resolve(mockListarAprobadas());
  return apiRequest('/cards/approved');
}

/**
 * @brief HU-002: registra una palabra nueva dentro de un mazo.
 *
 * El id del mazo viaja en la URL y los datos de la tarjeta en el body.
 * POST /api/v1/decks/:id/cards
 * @param {number} idMazo - Id del mazo.
 * @param {Object} datos - Datos de la tarjeta (palabra, definición, ejemplo, etc.).
 * @return {Promise<Object>} La tarjeta registrada.
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
 * @brief HU-002 / HU-003: verifica si una palabra ya existe en el mazo
 * antes de confirmar el registro.
 * POST /api/v1/cards/check-duplicate
 * @param {number} mazoId - Id del mazo.
 * @param {string} palabra - Palabra a verificar.
 * @param {string} definicion - Definición propuesta.
 * @param {string} ejemplo - Ejemplo de uso propuesto.
 * @return {Promise<Object>} Resultado de la verificación de duplicados.
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