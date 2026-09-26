import { apiRequest } from './httpClient';
import { USE_MOCK } from './apiConfig';
import {
  mockIniciarSesionRepaso,
  mockRegistrarValoracion,
} from './mocks/estudioMock';

/**
 * HU-010 (CA-4.1.1): inicia una sesión de repaso.
 *
 * Devuelve { inscripcion_id, total_tarjetas, tarjetas }: las tarjetas nuevas y las que ya
 * toca repasar según SM-2. Cada tarjeta trae `progreso` (null si es nueva).
 */
export async function iniciarSesionRepaso(inscripcionId) {
  if (USE_MOCK) return Promise.resolve(mockIniciarSesionRepaso(inscripcionId));
  return apiRequest('/study/review-session', {
    method: 'POST',
    body: JSON.stringify({ inscripcion_id: inscripcionId }),
  });
}

/**
 * HU-010 (CA-4.1.2): registra la valoración de una tarjeta.
 *
 * `valoracion` debe ser exactamente 'Repetir', 'Difícil', 'Buena' o 'Fácil' (con tilde y
 * mayúscula inicial): el backend lo valida en SM2Service. El cálculo del próximo repaso lo
 * hace el backend; la respuesta trae el progreso actualizado (intervalo_dias, etc.).
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