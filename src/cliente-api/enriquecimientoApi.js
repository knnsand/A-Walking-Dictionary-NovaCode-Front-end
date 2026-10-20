
import { apiRequest } from './httpClient';
import { USE_MOCK } from './apiConfig';

/**
 * HU-011: consulta sugerencias léxicas para una palabra.
 * Endpoint: GET /api/v1/enrichment/family/:word
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
