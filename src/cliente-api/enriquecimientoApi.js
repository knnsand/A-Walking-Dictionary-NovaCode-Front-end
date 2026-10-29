/**
 * @file enriquecimientoApi.js
 * @brief Cliente de enriquecimiento léxico (HU-011): familia de palabras desde WordNet.
 */

import { apiRequest } from './httpClient';
import { USE_MOCK } from './apiConfig';

/**
 * @brief HU-011: consulta sugerencias léxicas para una palabra.
 * Endpoint: GET /api/v1/enrichment/family/:word
 * @param {string} palabra - Palabra a consultar; se ignoran los espacios de los extremos.
 * @return {Promise<{palabra: string, sugerencias: Array}>} Palabra consultada y sus sugerencias.
 * @throws {Error} Si la palabra está vacía o el backend responde con error.
 */
export async function obtenerFamiliaPalabras(palabra) {
  const palabraLimpia = palabra?.trim();

  if (!palabraLimpia) {
    throw new Error('Debes indicar una palabra para buscar sugerencias.');
  }

  if (USE_MOCK) {
    // Temporal: permite trabajar en el frontend mientras se integra WordNet.
    return {
      palabra: palabraLimpia,
      sugerencias: [],
    };
  }

  return apiRequest(
    `/enrichment/family/${encodeURIComponent(palabraLimpia)}`
  );
}
