/**
 * @file coautoriaApi.js
 * @brief Cliente de coautorías: revisión de acepciones nuevas propuestas por los estudiantes.
 */

import { apiRequest } from './httpClient';
import { mockListarCoautoriasPendientes, mockAprobarCoautoria } from './mocks/coautoriaMock';

/**
 * @brief Capa intermedia entre los componentes de React (CoautoriaPendienteCard,
 * RevisionPalabras) y el backend real. Endpoints reales:
 * - GET    /aportes/pending           → listar pendientes
 * - PATCH  /aportes/:id/approve       → aprobar (con correcciones opcionales)
 * Las coautorías ya no se rechazan. Ver AporteController.js y aporteRoutes.js en el backend.
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * @brief Lista las coautorías/acepciones nuevas pendientes de revisión.
 * @return {Promise<Object[]>} Coautorías pendientes.
 */
export async function listarCoautoriasPendientes() {
  if (USE_MOCK) return Promise.resolve(mockListarCoautoriasPendientes());
  return apiRequest('/aportes/pending');
}

/**
 * @brief Aprueba una coautoría/acepción nueva, con correcciones opcionales de la docente.
 * @param {number} idCoautoria - id_aporte a aprobar.
 * @param {object} datosEditados - Vacío si se aprobó sin editar.
 * @return {Promise<Object>} La coautoría aprobada.
 */
export async function aprobarCoautoria(idCoautoria, datosEditados = {}) {
  if (USE_MOCK) return Promise.resolve(mockAprobarCoautoria(idCoautoria, datosEditados));
  return apiRequest(`/aportes/${idCoautoria}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(datosEditados),
  });
}