/**
 * @file useEncabezadoPagina.js
 * @brief Hook con el que cada pantalla declara el título que muestra la barra superior.
 */

import { useContext, useEffect } from 'react';
import { EncabezadoContext } from './EncabezadoContext';

/**
 * @brief Cada pantalla declara su título con esta línea:
 *
 *   useEncabezadoPagina('Mazos creados', 'Organizados por semana');
 *
 * y el layout lo pinta en la barra superior. Al salir de la pantalla el
 * encabezado se limpia solo. Las pantallas que aún no lo usan siguen
 * mostrando su propio título.
 * @param {string} titulo - Título de la pantalla (ya traducido).
 * @param {string} [subtitulo] - Subtítulo opcional (ya traducido).
 */
export function useEncabezadoPagina(titulo, subtitulo) {
  const { setEncabezado } = useContext(EncabezadoContext);

  useEffect(() => {
    setEncabezado({ titulo, subtitulo });
    return () => setEncabezado(null);
  }, [setEncabezado, titulo, subtitulo]);
}
