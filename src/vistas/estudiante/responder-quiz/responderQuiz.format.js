/**
 * @file responderQuiz.format.js
 * @brief Funciones puras de formato para la pantalla de HU-3.2.
 */

import i18n from '../../../i18n';

/**
 * @brief Fecha y hora legibles en la zona horaria del navegador, según el idioma activo.
 * @param {string} iso - Fecha ISO 8601 (la que devuelve el backend).
 * @return {string} Cadena vacía si la fecha no es válida.
 */
export function formatearFecha(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';

  return new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fecha);
}

/**
 * @brief Cronómetro "mm:ss" a partir de segundos (por ejemplo 125 -> "02:05").
 * @param {number} totalSegundos - Segundos restantes.
 * @return {string}
 */
export function formatearTiempo(totalSegundos) {
  const segundos = Math.max(0, Math.floor(totalSegundos));
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
}

/**
 * @brief "1 minute" / "10 minutes" (plural según el idioma activo).
 * @param {number} cantidad - Cantidad de minutos.
 * @return {string}
 */
export function textoMinutos(cantidad) {
  return i18n.t('quizSession.minutes', { count: cantidad });
}