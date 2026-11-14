/**
 * @file adminUsuariosApi.js
 * @brief HU-023: cliente API de la gestión de usuarios del administrador.
 *
 * Sigue el contrato del backend (docs/CONTRATO_FRONTEND_HU-023.md del repo del back).
 * Todas las rutas exigen un token con rol "administrador"; apiRequest agrega el JWT.
 */

import { apiRequest } from './httpClient';

/** @brief Roles que el administrador puede asignar. "invitado" no existe en la BD. */
export const ROLES_ASIGNABLES = ['estudiante', 'docente', 'administrador'];

/**
 * @brief CA-23.1: lista paginada de usuarios con búsqueda y filtros.
 *
 * GET /api/v1/admin/users?search=&rol=&activo=&page=&limit=
 *
 * @param {Object} [filtros]
 * @param {string} [filtros.search] - Texto a buscar en nombre o correo.
 * @param {string} [filtros.rol] - estudiante | docente | administrador.
 * @param {boolean|string} [filtros.activo] - true o false; vacío para todos.
 * @param {number} [filtros.page] - Página (desde 1).
 * @param {number} [filtros.limit] - Elementos por página (máx. 100).
 * @return {Promise<{data: Object[], page: number, limit: number, total: number, total_pages: number}>}
 */
export async function listarUsuarios(filtros = {}) {
  const parametros = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor === undefined || valor === null || valor === '') continue;
    parametros.set(clave, String(valor));
  }
  const consulta = parametros.toString();
  return apiRequest(`/admin/users${consulta ? `?${consulta}` : ''}`, { method: 'GET' });
}

/**
 * @brief CA-23.2: cambia el rol de una cuenta.
 *
 * PATCH /api/v1/admin/users/:id/role
 *
 * @param {number|string} idUsuario - Cuenta a modificar.
 * @param {string} rol - Nuevo rol (uno de ROLES_ASIGNABLES).
 * @return {Promise<Object>} El usuario actualizado.
 */
export async function cambiarRolUsuario(idUsuario, rol) {
  return apiRequest(`/admin/users/${idUsuario}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ rol }),
  });
}

/**
 * @brief CA-23.2: activa o desactiva una cuenta.
 *
 * PATCH /api/v1/admin/users/:id/status
 *
 * @param {number|string} idUsuario - Cuenta a modificar.
 * @param {boolean} activo - true para activar, false para desactivar.
 * @return {Promise<Object>} El usuario actualizado.
 */
export async function cambiarEstadoUsuario(idUsuario, activo) {
  return apiRequest(`/admin/users/${idUsuario}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ activo }),
  });
}
