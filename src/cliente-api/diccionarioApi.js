
import { apiRequest } from './httpClient';

/**
 * HU-016: consulta el vocabulario aprobado.
 * CA-16.1: listado.
 * CA-16.2: búsqueda parcial.
 * CA-16.3: resultados vacíos.
 */
export async function listarDiccionario(termino = '') {
  const busqueda = String(termino).trim();

  const parametros = new URLSearchParams();
  if (busqueda) parametros.set('q', busqueda);

  const query = parametros.toString();
  const ruta = query ? `/dictionary?${query}` : '/dictionary';

  const respuesta = await apiRequest(ruta);

  if (!Array.isArray(respuesta?.data)) {
    throw new Error('Invalid dictionary response.');
  }

  return respuesta.data;
}

/**
 * Consulta el detalle de una tarjeta aprobada.
 * GET /api/v1/dictionary/:card_id
 */
export async function obtenerDetallePalabra(idTarjeta) {
  if (!Number.isSafeInteger(Number(idTarjeta)) ||
      Number(idTarjeta) <= 0) {
    throw new Error('Invalid vocabulary card ID.');
  }

  return apiRequest(`/dictionary/${Number(idTarjeta)}`);
}
