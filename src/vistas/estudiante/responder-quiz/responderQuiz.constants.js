/**
 * @file responderQuiz.constants.js
 * @brief Claves de traducción de los textos de la pantalla de HU-3.2 (responder quiz y recibir nota).
 * El texto vive en src/i18n/locales/en.json.
 */

/** @brief Claves de traducción de la portada del quiz. */
export const TEXTOS_CLAVES = {
  tituloPagina: 'quizSession.page.title',
  descripcionPagina: 'quizSession.page.description',

  // Portada del quiz
  etiquetaTiempo: 'quizSession.cover.timeLimit',
  etiquetaApertura: 'quizSession.cover.opening',
  etiquetaCierre: 'quizSession.cover.closing',
  etiquetaEstado: 'quizSession.cover.status',
  botonIniciar: 'quizSession.cover.start',
  avisoInicio: 'quizSession.cover.startNotice',
  disponibleEl: 'quizSession.cover.availableOn', // usa {{date}}
  cerroEl: 'quizSession.cover.closedOn', // usa {{date}}

  // Las claves del objeto son los estados que devuelve el backend (no se traducen).
  estadoEfectivo: {
    programado: 'quizGenerator.status.scheduled',
    abierto: 'quizGenerator.status.open',
    cerrado: 'quizGenerator.status.closed',
  },
};

/** @brief Valores que devuelve el backend en `estado_efectivo` (CONTRATO_FRONTEND_HU-3.1.md). */
export const ESTADO = {
  PROGRAMADO: 'programado',
  ABIERTO: 'abierto',
  CERRADO: 'cerrado',
};


/** @brief Claves de traducción del formulario del quiz (preguntas, cronómetro y envío). */
export const TEXTOS_FORMULARIO_CLAVES = {
  tiempoRestante: 'quizSession.form.timeRemaining',
  contestadas: 'quizSession.form.answered', // usa {{answered}} y {{total}}
  botonFinalizar: 'quizSession.form.finish',
  botonEnviando: 'quizSession.form.sending',
  tiempoAgotado: 'quizSession.form.timeUp',

  // Confirmación cuando faltan preguntas por contestar (plural: usa {{count}})
  faltan: 'quizSession.form.missing',
  avisoSinContestar: 'quizSession.form.unansweredNotice',
  botonVolver: 'quizSession.form.back',
  botonEnviarIgual: 'quizSession.form.submitAnyway',
};


/** @brief Claves de traducción de la pantalla de resultado (CA-3.2.2 y CA-3.2.3). */
export const TEXTOS_RESULTADO_CLAVES = {
  titulo: 'quizSession.result.title',
  yaEnviado: 'quizSession.result.alreadySubmitted',
  etiquetaCalificacion: 'quizSession.result.grade',
  etiquetaAciertos: 'quizSession.result.correct',
  etiquetaErrores: 'quizSession.result.incorrect',
  etiquetaTiempo: 'quizSession.result.timeTaken',
  deTotal: 'quizSession.result.outOf', // usa {{value}} y {{total}}
  detalleTitulo: 'quizSession.result.detailTitle',
  tuRespuesta: 'quizSession.result.yourAnswer', // usa {{answer}}
  correcta: 'quizSession.result.correctStatus',
  incorrecta: 'quizSession.result.incorrectStatus',
  sinContestar: 'quizSession.result.unanswered',
  sinDetalle: 'quizSession.result.noDetail',
  botonVolver: 'quizSession.result.backToPanel',
};

/** @brief Claves de traducción del contenedor de la pantalla (carga y errores). */
export const TEXTOS_CONTENEDOR_CLAVES = {
  cargando: 'quizSession.container.loading',
  reintentar: 'quizSession.container.retry',
  errorGenerico: 'quizSession.container.genericError',
};