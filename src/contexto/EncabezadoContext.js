/**
 * @file EncabezadoContext.js
 * @brief Contexto del título y subtítulo de la pantalla activa.
 */

import { createContext } from 'react';

/**
 * @brief Contexto del encabezado de página (título + subtítulo que pinta el layout
 * en la barra superior). Por defecto no hace nada, así una pantalla puede
 * renderizarse sola (por ejemplo en un test) sin necesitar el layout.
 */
export const EncabezadoContext = createContext({
  encabezado: null,
  setEncabezado: () => {},
});