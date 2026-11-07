/**
 * @file mazosMock.js
 * @brief Datos simulados de mazos (HU-1.1) para trabajar el front sin back.
 *
 * Se usa cuando VITE_USE_MOCK=true. Los mazos viven en memoria: empiezan vacíos y se pierden
 * al recargar la página.
 */

/** @brief Mazos creados durante la sesión (en memoria). */
let mazos = [];
/** @brief Id que recibirá el próximo mazo creado. */
let siguienteId = 1;

/**
 * @brief Simula GET /api/v1/decks: lista los mazos creados.
 * @return {Object[]} Copia de la lista de mazos.
 */
export function mockListarMazos() {
  return [...mazos];
}

/**
 * @brief Simula POST /api/v1/decks: crea un mazo con un id nuevo y la fecha de creación.
 * @param {Object} datos - Datos del formulario (nombre_lectura, autor, semana, etc.).
 * @return {Object} Mazo creado.
 */
export function mockCrearMazo(datos) {
  const nuevoMazo = {
    id_mazo: siguienteId++,
    ...datos,
    fecha_creacion: new Date().toISOString(),
  };

  mazos.push(nuevoMazo);
  return nuevoMazo;
}

/**
 * @brief Simula el cambio de estado de un mazo, por ejemplo de "abierto" a "cerrado" (CA-1.1.3).
 * @param {number} idMazo - Id del mazo.
 * @param {string} estado - Estado nuevo del mazo.
 * @return {Object} Copia del mazo actualizado.
 * @throws {Error} Si no existe un mazo con ese id.
 */
export function mockActualizarEstadoMazo(idMazo, estado) {
  const indice = mazos.findIndex(
    (mazo) => mazo.id_mazo === idMazo
  );

  if (indice === -1) {
    throw new Error('Mazo no encontrado.');
  }

  mazos[indice] = {
    ...mazos[indice],
    estado,
  };

  return { ...mazos[indice] };
}