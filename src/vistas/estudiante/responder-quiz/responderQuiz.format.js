// vistas/estudiante/responder-quiz/responderQuiz.format.js
// Funciones puras de formato para la pantalla de HU-3.2.

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
 * Cronómetro "mm:ss" a partir de segundos (por ejemplo 125 -> "02:05").
 * @param {number} totalSegundos
 * @returns {string}
 */
export function formatearTiempo(totalSegundos) {
  const segundos = Math.max(0, Math.floor(totalSegundos));
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
}

/** "1 minuto" / "10 minutos". */
export function textoMinutos(cantidad) {
  return `${cantidad} ${cantidad === 1 ? 'minuto' : 'minutos'}`;
}