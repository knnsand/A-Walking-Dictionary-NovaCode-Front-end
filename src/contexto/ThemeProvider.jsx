import { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';

const STORAGE_KEY = 'walking-dictionary-tema';

/**
 * Provee el tema actual (claro/oscuro) a toda la app y lo persiste
 * en localStorage. Al cambiar, actualiza el atributo data-theme en
 * <html>, que es el gancho que usa index.css para aplicar las
 * variables de color del modo oscuro.
 */
export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => localStorage.getItem(STORAGE_KEY) || 'claro');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  function alternarTema() {
    setTema((actual) => (actual === 'claro' ? 'oscuro' : 'claro'));
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}