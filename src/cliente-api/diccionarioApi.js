/**
 * @file diccionarioApi.js
 * @brief Cliente del Diccionario Global (HU-016): vocabulario aprobado por la docente.
 */

import { apiRequest } from './httpClient';

/**
 * @brief HU-016: consulta el vocabulario aprobado.
 * CA-16.1: listado.
 * CA-16.2: búsqueda parcial.
 * CA-16.3: resultados vacíos.
 * GET /api/v1/dictionary?q=
 * @param {string} [termino] - Texto a buscar; si está vacío se lista todo.
 * @return {Promise<Object[]>} Palabras aprobadas que coinciden con la búsqueda.
 * @throws {Error} Si la respuesta del backend no trae un arreglo en `data`.
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
 * @brief Consulta el detalle de una tarjeta aprobada.
 * GET /api/v1/dictionary/:card_id
 * @param {number|string} idTarjeta - Id de la tarjeta; debe ser un entero positivo.
 * @return {Promise<Object>} Detalle de la palabra.
 * @throws {Error} Si el id no es válido.
 */
export async function obtenerDetallePalabra(idTarjeta) {
  if (!Number.isSafeInteger(Number(idTarjeta)) ||
      Number(idTarjeta) <= 0) {
    throw new Error('Invalid vocabulary card ID.');
  }

  return apiRequest(`/dictionary/${Number(idTarjeta)}`);
}
