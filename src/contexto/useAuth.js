/**
 * @file useAuth.js
 * @brief Hook para leer la sesión del usuario desde cualquier componente.
 */

import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * @brief Devuelve el valor de AuthContext (token, usuario, rol, ids, perfilCompleto y acciones).
 * @return {Object} Valor actual del contexto de autenticación.
 */
export function useAuth() {
  return useContext(AuthContext);
}