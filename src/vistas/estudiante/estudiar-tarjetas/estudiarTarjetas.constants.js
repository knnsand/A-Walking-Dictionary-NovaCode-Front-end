/**
 * @file estudiarTarjetas.constants.js
 * @brief HU-010: constantes de la vista de estudio con flashcards.
 */

/**
 * @brief Valores exactos que valida SM2Service en el back (con tilde y mayúscula inicial).
 * NO se traducen: se envían tal cual al backend.
 */
export const VALORACIONES = Object.freeze({
  REPETIR: 'Repetir',
  DIFICIL: 'Difícil',
  BUENA: 'Buena',
  FACIL: 'Fácil',
});

/**
 * @brief Fuente única para los botones de valoración, los atajos de teclado y la pastilla de atajos.
 * Los íconos se asignan en BotonesValoracion.jsx por `id`. `etiquetaKey` es la clave de
 * traducción del texto visible.
 */
export const VALORACIONES_UI = [
  { id: 'repetir', valor: VALORACIONES.REPETIR, tecla: '1', etiquetaKey: 'studySession.ratings.repeat' },
  { id: 'dificil', valor: VALORACIONES.DIFICIL, tecla: '2', etiquetaKey: 'studySession.ratings.hard' },
  { id: 'buena', valor: VALORACIONES.BUENA, tecla: '3', etiquetaKey: 'studySession.ratings.good' },
  { id: 'facil', valor: VALORACIONES.FACIL, tecla: '4', etiquetaKey: 'studySession.ratings.easy' },
];

/** @brief Clave de traducción del modo de estudio (el texto vive en src/i18n/locales/en.json). */
export const TEXTO_MODO_CLAVE = 'studySession.mode';
/** @brief Clave de traducción del título cuando no se conoce el mazo. */
export const TITULO_POR_DEFECTO_CLAVE = 'studySession.title';

/** @brief Clave de traducción del error cuando el estudiante no tiene inscripción. */
export const MENSAJE_SIN_INSCRIPCION_CLAVE = 'studySession.errors.noEnrollment';