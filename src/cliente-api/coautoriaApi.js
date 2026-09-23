import { apiRequest } from './httpClient';
import { mockListarCoautoriasPendientes, mockAprobarCoautoria, mockRechazarCoautoria } from './mocks/coautoriaMock';

/**
 * Capa intermedia entre los componentes de React (CoautoriaPendienteCard,
 * RevisionPalabras) y el backend real. Endpoints reales:
 * - GET    /aportes/pending           → listar pendientes
 * - PATCH  /aportes/:id/approve       → aprobar (con correcciones opcionales)
 * - DELETE /contributions/:id         → rechazar
 * Ver AporteController.js, aporteRoutes.js y contributionRoutes.js en el backend.
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** Lista las coautorías/acepciones nuevas pendientes de revisión. */
export async function listarCoautoriasPendientes() {
  if (USE_MOCK) return Promise.resolve(mockListarCoautoriasPendientes());
  return apiRequest('/aportes/pending');
}

/**
 * Aprueba una coautoría/acepción nueva, con correcciones opcionales de la docente.
 * @param {number} idCoautoria - id_aporte a aprobar.
 * @param {object} datosEditados - Vacío si se aprobó sin editar.
 */
export async function aprobarCoautoria(idCoautoria, datosEditados = {}) {
  if (USE_MOCK) return Promise.resolve(mockAprobarCoautoria(idCoautoria, datosEditados));
  return apiRequest(`/aportes/${idCoautoria}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(datosEditados),
  });
}

/** Rechaza una coautoría o acepción nueva. */
export async function rechazarCoautoria(idCoautoria) {
  if (USE_MOCK) return Promise.resolve(mockRechazarCoautoria(idCoautoria));
  return apiRequest(`/contributions/${idCoautoria}`, { method: 'DELETE' });
}