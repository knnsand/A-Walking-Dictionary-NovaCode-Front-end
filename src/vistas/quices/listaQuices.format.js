// vistas/quices/listaQuices.format.js
// Funciones puras de formato para la lista de quices (HU-009).

const formateadorFecha = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/**
 * Fecha y hora legibles en la zona horaria del navegador.
 * @param {string} iso - Fecha ISO 8601 (la que devuelve el backend).
 * @returns {string} Cadena vacía si la fecha no es válida.
 */
export function formatearFecha(iso) {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? '' : formateadorFecha.format(fecha);
}

/**
 * " · Nota 4.5" para el quiz ya respondido. Sin "sobre 5.0": la escala de la
 * calificación sigue pendiente de confirmar con la docente (contrato, sección 3).
 * @param {{ calificacion?: number|string }|null} resultado
 * @returns {string} Cadena vacía si no hay una calificación numérica.
 */
export function textoNota(resultado) {
  const bruta = resultado?.calificacion;
  // Number(null) y Number('') dan 0: sin calificación no se debe mostrar "Nota 0.0".
  if (bruta == null || bruta === '') return '';

  const nota = Number(bruta);
  return Number.isFinite(nota) ? ` · Nota ${nota.toFixed(1)}` : '';
}
