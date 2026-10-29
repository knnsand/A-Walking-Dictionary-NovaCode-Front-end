/**
 * @file revisionPalabras.constants.js
 * @brief Constantes del panel de revisión de palabras.
 */

/**
 * @brief Configuración de las pestañas del panel de Revisión de Palabras.
 *
 * Cada objeto define:
 * - id: identificador interno usado en el estado `tabActivo` de
 *   RevisionPalabras.jsx (useState('nuevos')) y en las comparaciones
 *   de renderizado condicional (tabActivo === 'nuevos', etc.).
 * - labelKey: clave de traducción del texto visible de la pestaña.
 *
 * Se centraliza aquí (en vez de hardcodear un array dentro del
 * componente) para que agregar, quitar o reordenar pestañas sea un
 * cambio de una sola línea, sin tocar la lógica de RevisionPalabras.jsx.
 */
export const TABS = [
  { id: 'nuevos', labelKey: 'reviewPage.tabs.newTerms' },
  { id: 'coautoria', labelKey: 'reviewPage.tabs.coauthorship' },
  { id: 'historial', labelKey: 'reviewPage.tabs.history' },
];

/**
 * @brief Registros lingüísticos. `value` es el valor que se guarda en la base de datos
 * y NO se traduce; `labelKey` es la clave del texto que se muestra.
 */
export const REGISTROS = [
  { value: 'Formal', labelKey: 'registers.formal' },
  { value: 'Informal', labelKey: 'registers.informal' },
  { value: 'Slang', labelKey: 'registers.slang' },
  { value: 'Coloquial', labelKey: 'registers.colloquial' },
  { value: 'Anticuado', labelKey: 'registers.archaic' },
];

/** @brief Valor guardado -> clave de traducción (para mostrar el registro de una tarjeta ya guardada). */
export const REGISTRO_CLAVES = Object.fromEntries(
  REGISTROS.map(({ value, labelKey }) => [value, labelKey])
);