/**
 * @file ThemeProvider.jsx
 * @brief Proveedor del tema visual claro/oscuro.
 */

import { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';

/** @brief Clave de localStorage donde se guarda el tema elegido. */
const STORAGE_KEY = 'walking-dictionary-tema';

/**
 * @brief Provee el tema actual (claro/oscuro) a toda la app y lo persiste
 * en localStorage. Al cambiar, actualiza el atributo data-theme en
 * <html>, que es el gancho que usa index.css para aplicar las
 * variables de color del modo oscuro.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Árbol de componentes de la aplicación.
 * @return {JSX.Element}
 */
export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => localStorage.getItem(STORAGE_KEY) || 'claro');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  /** @brief Cambia entre el tema claro y el oscuro. */
  function alternarTema() {
    setTema((actual) => (actual === 'claro' ? 'oscuro' : 'claro'));
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}