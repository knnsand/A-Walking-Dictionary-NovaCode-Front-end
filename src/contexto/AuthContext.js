/**
 * @file AuthContext.js
 * @brief Contexto de autenticación. El valor lo provee AuthProvider.jsx y se lee con useAuth().
 */

import { createContext } from 'react';

/** @brief Contexto con la sesión actual (token, usuario, rol) y las acciones de login/logout. */
export const AuthContext = createContext(null);