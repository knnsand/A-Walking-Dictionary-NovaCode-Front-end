/**
 * @file ThemeContext.js
 * @brief Contexto del tema visual de la aplicación.
 */

import { createContext } from 'react';

/** @brief Contexto de tema visual (claro/oscuro). Ver ThemeProvider.jsx. */
export const ThemeContext = createContext(null);