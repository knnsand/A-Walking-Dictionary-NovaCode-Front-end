// vistas/estudiante/estudiar-tarjetas/estudiarTarjetas.constants.js
// HU-010: constantes de la vista de estudio con flashcards.

/**
 * Valores exactos que valida SM2Service en el back (con tilde y mayúscula inicial).
 */
export const VALORACIONES = Object.freeze({
  REPETIR: 'Repetir',
  DIFICIL: 'Difícil',
  BUENA: 'Buena',
  FACIL: 'Fácil',
});

/**
 * Fuente única para los botones de valoración, los atajos de teclado y la pastilla de atajos.
 * Los íconos se asignan en BotonesValoracion.jsx por `id`.
 */
export const VALORACIONES_UI = [
  { id: 'repetir', valor: VALORACIONES.REPETIR, tecla: '1', etiqueta: 'Repetir' },
  { id: 'dificil', valor: VALORACIONES.DIFICIL, tecla: '2', etiqueta: 'Difícil' },
  { id: 'buena', valor: VALORACIONES.BUENA, tecla: '3', etiqueta: 'Buena' },
  { id: 'facil', valor: VALORACIONES.FACIL, tecla: '4', etiqueta: 'Fácil' },
];

export const TEXTO_MODO = 'Modo flashcards 3D interactivo';
export const TITULO_POR_DEFECTO = 'Repaso de vocabulario';

export const MENSAJE_SIN_INSCRIPCION =
  'No se encontró tu inscripción al curso. Vuelve a los mazos e inténtalo de nuevo.';

// TODO: reemplazar por la inscripción real del estudiante cuando AuthContext la exponga
// (hoy el rol es simulado con SelectorDeRolTemporal). Se puede forzar con VITE_INSCRIPCION_ID.
export const INSCRIPCION_ID_TEMPORAL = Number(import.meta.env.VITE_INSCRIPCION_ID) || 1;
