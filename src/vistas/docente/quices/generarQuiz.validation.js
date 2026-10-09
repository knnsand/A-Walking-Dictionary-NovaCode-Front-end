import { ERRORES_VALIDACION, TITULO_MAX } from './generarQuiz.constants';

// Entero >= 1. Rechaza vacío, decimales, negativos y notación científica.
function esEnteroPositivo(valor) {
  const texto = String(valor ?? '').trim();
  return /^\d+$/.test(texto) && Number(texto) >= 1;
}

// Los campos datetime-local entregan "2026-10-12T15:00" (hora local).
// Devuelve null si el valor está vacío o no es una fecha válida.
function aFecha(valor) {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/**
 * Valida el formulario de generación de quiz (HU-3.1).
 * Reglas: docs/contrato-quiz.md y docs/CONTRATO_FRONTEND_HU-3.1.md (backend).
 *
 * @param {Object} datos
 * @param {string|number} datos.cursoId - curso elegido ('' si no hay).
 * @param {number[]} datos.mazosSeleccionados - ids de mazo elegidos.
 * @param {Object} datos.form - titulo, fecha_apertura, fecha_cierre,
 *   tiempo_limite_min y cantidad_preguntas, como los entrega el formulario.
 * @param {Date} [ahora] - hora de referencia (se inyecta en las pruebas).
 * @returns {Object} errores por campo; vacío si el formulario es válido.
 *   Claves posibles: curso, mazos, titulo, fecha_apertura, fecha_cierre,
 *   tiempo_limite_min, cantidad_preguntas.
 */
export function validarFormularioQuiz({ cursoId, mazosSeleccionados, form }, ahora = new Date()) {
  const errores = {};

  if (!cursoId) {
    errores.curso = ERRORES_VALIDACION.curso;
  }

  if (!mazosSeleccionados || mazosSeleccionados.length === 0) {
    errores.mazos = ERRORES_VALIDACION.mazos;
  }

  const titulo = (form.titulo ?? '').trim();
  if (!titulo) {
    errores.titulo = ERRORES_VALIDACION.tituloVacio;
  } else if (titulo.length > TITULO_MAX) {
    errores.titulo = ERRORES_VALIDACION.tituloLargo;
  }

  const apertura = aFecha(form.fecha_apertura);
  const cierre = aFecha(form.fecha_cierre);

  if (!apertura) {
    errores.fecha_apertura = ERRORES_VALIDACION.aperturaVacia;
  } else if (apertura <= ahora) {
    errores.fecha_apertura = ERRORES_VALIDACION.aperturaPasada;
  }

  if (!cierre) {
    errores.fecha_cierre = ERRORES_VALIDACION.cierreVacio;
  } else if (apertura && cierre <= apertura) {
    errores.fecha_cierre = ERRORES_VALIDACION.cierreAnterior;
  }

  const tiempoValido = esEnteroPositivo(form.tiempo_limite_min);
  if (!tiempoValido) {
    errores.tiempo_limite_min = ERRORES_VALIDACION.tiempoInvalido;
  }

  // La ventana entre apertura y cierre debe alcanzar para el tiempo límite.
  if (!errores.fecha_cierre && apertura && cierre && tiempoValido) {
    const ventanaMin = (cierre - apertura) / 60000;
    if (ventanaMin < Number(form.tiempo_limite_min)) {
      errores.fecha_cierre = ERRORES_VALIDACION.ventanaCorta;
    }
  }

  // La cantidad de preguntas es opcional: solo se valida si se escribió algo.
  const cantidad = String(form.cantidad_preguntas ?? '').trim();
  if (cantidad !== '' && !esEnteroPositivo(cantidad)) {
    errores.cantidad_preguntas = ERRORES_VALIDACION.cantidadInvalida;
  }

  return errores;
}