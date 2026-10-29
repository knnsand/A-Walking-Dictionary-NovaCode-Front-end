/**
 * @file listaQuices.format.js
 * @brief Funciones puras de formato para la lista de quices (HU-009).
 */

import i18n from '../../i18n';

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
 * @brief " · Grade 4.5" para el quiz ya respondido. Sin "out of 5.0": la escala de la
 * calificación sigue pendiente de confirmar con la docente (contrato, sección 3).
 * @param {{ calificacion?: number|string }|null} resultado - Resultado del estudiante en el quiz.
 * @return {string} Cadena vacía si no hay una calificación numérica.
 */
export function textoNota(resultado) {
  const bruta = resultado?.calificacion;
  // Number(null) y Number('') dan 0: sin calificación no se debe mostrar "Grade 0.0".
  if (bruta == null || bruta === '') return '';

  const nota = Number(bruta);
  return Number.isFinite(nota) ? ` · ${i18n.t('quizList.grade', { grade: nota.toFixed(1) })}` : '';
}
