/**
 * @file listaQuices.constants.js
 * @brief HU-009: constantes y claves de traducción de la lista de quices (docente y estudiante).
 * Los textos viven en src/i18n/locales/en.json (bloque "quizList").
 */

/** @brief Valores que devuelve el backend en `estado_efectivo`: NO se traducen. */
export const ESTADO = {
  PROGRAMADO: 'programado',
  ABIERTO: 'abierto',
  CERRADO: 'cerrado',
};

/** @brief Claves de traducción de los textos de la lista. */
export const TEXTOS_CLAVES = {
  cargando: 'quizList.loading',
  vacio: 'quizList.empty',
  vacioDocente: 'quizList.emptyTeacher',
  errorGenerico: 'quizList.loadFailed',

  semanaCorte: 'quizList.cutoffWeek',
  apertura: 'quizList.opening',
  cierre: 'quizList.closing',
  tiempoLimite: 'quizList.timeLimit',
  respondido: 'quizList.answered',

  // Exportar a PDF (solo docente, HU-3.3): se reutilizan las claves compartidas.
  botonExportarQuiz: 'exportActions.quizPrintable',
  botonExportarQuizAria: 'exportActions.quizPrintableAria',

  // Acciones del estudiante: llevan a /estudiante/quices/:idQuiz
  accionResponder: 'quizList.actions.take',
  accionResultado: 'quizList.actions.viewResult',
  accionDetalle: 'quizList.actions.viewDetails',
};

/** @brief Título y subtítulo según quién mira la lista. */
export const TEXTOS_POR_ROL = {
  estudiante: {
    titulo: 'quizList.student.title',
    descripcion: 'quizList.student.description',
  },
  docente: {
    titulo: 'quizList.teacher.title',
    descripcion: 'quizList.teacher.description',
  },
};

/**
 * @brief Etiqueta de cada estado del quiz.
 * Siempre se usa `estado_efectivo`, nunca `estado` (docs/contrato-quiz-estudiante.md).
 * Las claves del objeto son los estados del backend (no se traducen); los valores, claves de traducción.
 */
export const ETIQUETA_ESTADO = {
  [ESTADO.PROGRAMADO]: 'quizList.status.scheduled',
  [ESTADO.ABIERTO]: 'quizList.status.open',
  [ESTADO.CERRADO]: 'quizList.status.closed',
};

/**
 * @brief Clase del badge de cada estado: .badge-abierto y .badge-cerrado vienen de index.css;
 * "programado" no tiene en la librería global y se define en lista-quices.css.
 */
export const CLASE_BADGE_ESTADO = {
  [ESTADO.PROGRAMADO]: 'quiz-badge--programado',
  [ESTADO.ABIERTO]: 'badge-abierto',
  [ESTADO.CERRADO]: 'badge-cerrado',
};
