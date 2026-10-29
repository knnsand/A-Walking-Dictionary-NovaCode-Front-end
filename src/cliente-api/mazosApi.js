/**
 * @file mazosApi.js
 * @brief Cliente de mazos de estudio: listar, crear y cambiar su estado.
 */

import { apiRequest } from './httpClient';
import { mockListarMazos, mockCrearMazo, mockActualizarEstadoMazo} from './mocks/mazosMock';
import { USE_MOCK } from './apiConfig';

/**
 * @brief Lista los mazos de estudio.
 * GET /api/v1/decks
 * @return {Promise<Object[]>} Mazos disponibles.
 */
export async function listarMazos() {
  if (USE_MOCK) {
    return mockListarMazos();
  }
  return apiRequest('/decks');
}

/**
 * @brief Crea un mazo de estudio nuevo (solo docente).
 * POST /api/v1/decks
 * @param {Object} datos - Datos del mazo (nombre, semana, variante regional, etc.).
 * @return {Promise<Object>} El mazo creado.
 */
export async function crearMazo(datos) {
  if (USE_MOCK) {
    return mockCrearMazo(datos);
  }
  return apiRequest('/decks', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

/**
 * @brief Cambia el estado de un mazo (por ejemplo, abierto o cerrado).
 * PATCH /api/v1/decks/:id/estado
 * @param {number} idMazo - Id del mazo.
 * @param {string} estado - Nuevo estado del mazo.
 * @return {Promise<Object>} El mazo actualizado.
 */
export async function actualizarEstadoMazo(idMazo, estado) {
  if (USE_MOCK) {
    return mockActualizarEstadoMazo(idMazo, estado);
  }

  return apiRequest(`/decks/${idMazo}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}