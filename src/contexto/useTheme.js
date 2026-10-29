/**
 * @file useTheme.js
 * @brief Hook para leer y cambiar el tema visual (claro/oscuro).
 */

import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

/**
 * @brief Devuelve el valor de ThemeContext.
 * @return {{tema: string, alternarTema: Function}} Tema actual ('claro' u 'oscuro') y la función para alternarlo.
 */
export function useTheme() {
  return useContext(ThemeContext);
}