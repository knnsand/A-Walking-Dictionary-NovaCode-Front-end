/**
 * @file participacionMazo.constants.js
 * @brief Constantes de la vista de participación por mazo (HU-2.3).
 */

/** @brief Claves de traducción de los textos de la vista (el texto vive en src/i18n/locales/en.json). */
export const TEXTOS_CLAVES = {
  titulo: 'participationPage.title',
  descripcion: 'participationPage.description',
  filtroSinAportes: 'participationPage.onlyNoContributions',
  botonActualizar: 'participationPage.refreshNow',
  cargando: 'participationPage.loading',
  sinResultadosFiltro: 'participationPage.noResults',
  errorGenerico: 'participationPage.genericError',
};

/** @brief Columnas de la tabla de participación. */
export const COLUMNAS = [
  { key: 'nombre_completo', labelKey: 'participationPage.columns.student' },
  { key: 'palabras_aportadas', labelKey: 'participationPage.columns.words' },
  { key: 'coautorias', labelKey: 'participationPage.columns.coauthorships' },
  { key: 'tarjetas_pendientes', labelKey: 'participationPage.columns.pending' },
  { key: 'tarjetas_aprobadas', labelKey: 'participationPage.columns.approved' },
];

/**
 * @brief Mismo criterio que usa el backend para el filtro ?sinAportes=true (CA-2.3.2),
 * replicado aquí solo para pintar la etiqueta de la fila, no para filtrar en cliente.
 * @param {Object} fila - Participación de un estudiante.
 * @return {boolean} true si el estudiante no tiene palabras ni coautorías.
 */
export const sinAportesCriterio = (fila) => fila.palabras_aportadas === 0 && fila.coautorias === 0;