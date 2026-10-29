/**
 * @file estudioApi.js
 * @brief Cliente de repaso espaciado (HU-010): sesiones de repaso y valoración de tarjetas con SM-2.
 */

import { apiRequest } from './httpClient';
import { USE_MOCK } from './apiConfig';
import {
  mockIniciarSesionRepaso,
  mockRegistrarValoracion,
} from './mocks/estudioMock';

/**
 * @brief HU-010 (CA-4.1.1): inicia una sesión de repaso.
 *
 * Devuelve { inscripcion_id, total_tarjetas, tarjetas }: las tarjetas nuevas y las que ya
 * toca repasar según SM-2. Cada tarjeta trae `progreso` (null si es nueva).
 * @param {number} inscripcionId - Id de la inscripción activa del estudiante.
 * @return {Promise<{inscripcion_id: number, total_tarjetas: number, tarjetas: Object[]}>}
 */
export async function iniciarSesionRepaso(inscripcionId) {
  if (USE_MOCK) return Promise.resolve(mockIniciarSesionRepaso(inscripcionId));
  return apiRequest('/study/review-session', {
    method: 'POST',
    body: JSON.stringify({ inscripcion_id: inscripcionId }),
  });
}

/**
 * @brief HU-010 (CA-4.1.2): registra la valoración de una tarjeta.
 *
 * `valoracion` debe ser exactamente 'Repetir', 'Difícil', 'Buena' o 'Fácil' (con tilde y
 * mayúscula inicial): el backend lo valida en SM2Service. El cálculo del próximo repaso lo
 * hace el backend; la respuesta trae el progreso actualizado (intervalo_dias, etc.).
 * @param {number} inscripcionId - Id de la inscripción activa del estudiante.
 * @param {number} tarjetaId - Id de la tarjeta valorada.
 * @param {string} valoracion - 'Repetir', 'Difícil', 'Buena' o 'Fácil'.
 * @return {Promise<Object>} El progreso actualizado de la tarjeta.
 */
export async function registrarValoracion(inscripcionId, tarjetaId, valoracion) {
  if (USE_MOCK) {
    return Promise.resolve(
      mockRegistrarValoracion(inscripcionId, tarjetaId, valoracion)
    );
  }
  return apiRequest('/study/review-session/review', {
    method: 'POST',
    body: JSON.stringify({
      inscripcion_id: inscripcionId,
      tarjeta_id: tarjetaId,
      valoracion,
    }),
  });
}