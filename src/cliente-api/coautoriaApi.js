import { apiRequest } from './httpClient';
import { mockListarCoautoriasPendientes, mockAprobarCoautoria, mockRechazarCoautoria } from './mocks/coautoriaMock';

/**
 * Es la capa intermedia entre los componentes de React (CoautoriaPendienteCard,
 * RevisionPalabras) y el origen real de los datos. Cada función revisa
 * USE_MOCK para decidir si responde con datos simulados en memoria
 * (coautoriaMock.js) o si llama al backend real vía apiRequest().
 *
 * Ventaja de este patrón: el día que el backend esté desplegado, se
 * cambia VITE_USE_MOCK=false en el .env y toda la app empieza a usar
 * la API real sin tocar ningún componente visual.
 *
 * NOTA: los endpoints /coauthorships/* son provisionales (no están
 * definidos en las especificaciones técnicas originales de HU-004/
 * HU-005); se nombraron siguiendo la convención REST del resto del
 * backlog (/cards, /decks, etc.).
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** Lista las coautorías en estado pendiente_revision. */
export async function listarCoautoriasPendientes() {
  if (USE_MOCK) return Promise.resolve(mockListarCoautoriasPendientes());
  return apiRequest('/coauthorships?estado=pendiente_revision');
}

/**
 * Aprueba una coautoría, con correcciones opcionales de la docente
 * (gramática, ortografía, estilo) aplicadas en el mismo paso.
 *
 * @param {number} idCoautoria
 * @param {object} datosEditados - Vacío si se aprobó sin editar.
 */
export async function aprobarCoautoria(idCoautoria, datosEditados = {}) {
  if (USE_MOCK) return Promise.resolve(mockAprobarCoautoria(idCoautoria, datosEditados));
  return apiRequest(`/coauthorships/${idCoautoria}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(datosEditados),
  });
}

/**
 * Rechaza una coautoría porque su contenido no concuerda con la
 * palabra a la que se quería asociar.
 */
export async function rechazarCoautoria(idCoautoria) {
  if (USE_MOCK) return Promise.resolve(mockRechazarCoautoria(idCoautoria));
  return apiRequest(`/coauthorships/${idCoautoria}/reject`, { method: 'PATCH' });
}