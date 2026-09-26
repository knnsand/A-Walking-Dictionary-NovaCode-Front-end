/**
 * analiticasApi.js
 * Cliente para el endpoint de HU-2.3 (HU-006 en la numeración de sprint del equipo).
 * Fuentes: doc/CONTRATO_FRONTEND_HU-2.3.md + docs/CONTRATO_AUTENTICACION_FRONTEND.md
 *
 * Auth: la tabla de rutas del contrato de autenticación (sección 5) lista
 * `GET /teacher/analytics/deck/:id` como nivel "Docente" — sí requiere
 * `Authorization: Bearer <token>` con rol docente. El contrato de HU-2.3 quedó
 * desactualizado en ese punto (decía "sin auth todavía"), pero el de
 * autenticación es el vigente. El token se recibe por parámetro en vez de
 * leerlo de localStorage aquí, para no duplicar la clave de storage que ya
 * maneja AuthProvider.jsx — quien llama a esta función se lo pasa desde
 * `useAuth()`.
 *
 * Otras notas del contrato que siguen vigentes:
 *  - El query param del filtro es `sinAportes=true` (no `filtro=sin_aportes`, que es
 *    lo que dice el backlog/CLAUDE.md — es una divergencia real, no un error de este archivo).
 *  - No hay WebSockets: "tiempo real" (CA-2.3.3) = volver a pedir el endpoint. Este
 *    módulo no hace polling por sí solo; la vista decide cuándo llamar a refrescar.
 *  - `apiRequest` (httpClient.js) ya desenvuelve el `{ error: "mensaje legible" }`
 *    del backend y lanza un `Error` normal con ese texto — incluidos los 401/403
 *    de rutas protegidas ("Token de autenticación no proporcionado",
 *    "Token inválido o expirado", "No tiene permisos para acceder a este recurso").
 */

import { apiRequest } from './httpClient';
import { USE_MOCK } from './apiConfig';
import { obtenerParticipacionMazoMock } from './mocks/analiticasMock';

/**
 * Obtiene la participación de todos los estudiantes inscritos en un mazo.
 * @param {number|string} mazoId - id del mazo (path param :id del contrato).
 * @param {{ sinAportes?: boolean, token?: string }} [opciones] - `token` es el
 *   JWT de `useAuth()`; sin él, el backend responde 401.
 * @returns {Promise<Array<{
 *   estudiante_id: number,
 *   nombre_completo: string,
 *   palabras_aportadas: number,
 *   coautorias: number,
 *   tarjetas_pendientes: number,
 *   tarjetas_aprobadas: number
 * }>>}
 * @throws {Error} con `.message` listo para mostrar al usuario (400 id no numérico,
 *   401 sin token / token vencido, 403 sin rol docente, 404 mazo no existe,
 *   500 error inesperado — según responda el backend).
 */
export async function obtenerParticipacionMazo(mazoId, { sinAportes = false, token } = {}) {
  if (USE_MOCK) {
    return obtenerParticipacionMazoMock(mazoId, { sinAportes });
  }

  const query = sinAportes ? '?sinAportes=true' : '';
  return apiRequest(`/teacher/analytics/deck/${mazoId}${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}