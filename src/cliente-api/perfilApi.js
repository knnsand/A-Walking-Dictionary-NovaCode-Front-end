/**
 * @file perfilApi.js
 * @brief Cliente del perfil académico del estudiante y de su contexto de inscripción.
 */

import { apiRequest } from './httpClient';

/**
 * @brief Obtiene el perfil de un usuario.
 * GET /api/v1/users/:id
 * @param {number} estudianteId - Id del usuario (id_usuario).
 * @return {Promise<Object>} Datos del perfil (nivel_ingles, codigo_estudiantil, avatar, intereses, etc.).
 */
export async function obtenerPerfil(estudianteId) {
  return apiRequest(`/users/${estudianteId}`, {
    method: 'GET',
  });
}

/**
 * @brief Actualiza el perfil académico del usuario autenticado.
 * PATCH /api/v1/users/profile
 * @param {Object} datos - Campos editables del perfil.
 * @param {string} datos.nivel_ingles - Nivel de inglés del estudiante.
 * @param {string} datos.codigo_estudiantil - Código institucional del estudiante.
 * @param {string} datos.avatar - Avatar elegido.
 * @param {string[]} datos.intereses - Intereses literarios seleccionados.
 * @return {Promise<Object>} El perfil actualizado.
 */
export async function actualizarPerfil(datos) {
  return apiRequest('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify({
      nivel_ingles: datos.nivel_ingles,
      codigo_estudiantil: datos.codigo_estudiantil,
      avatar: datos.avatar,
      intereses: datos.intereses,
    }),
  });
}

/**
 * @brief Obtiene el contexto académico del estudiante (su inscripción activa).
 * GET /api/v1/students/:id/context
 * @param {number} estudianteId - Id del estudiante.
 * @return {Promise<Object>} Contexto académico, incluye `id_inscripcion`.
 */
export async function obtenerContextoAcademico(estudianteId) {
  return apiRequest(`/students/${estudianteId}/context`, {
    method: 'GET',
  });
}