export const TITULO_MAX = 200;

// Claves de traducción de los textos de la pantalla (el texto vive en src/i18n/locales/en.json).
export const TEXTOS_CLAVES = {
  titulo: 'quizGenerator.title',
  descripcion: 'quizGenerator.description',

  // Campos del formulario
  etiquetaCurso: 'quizGenerator.fields.course',
  placeholderCurso: 'quizGenerator.fields.selectCourse',
  etiquetaMazos: 'quizGenerator.fields.decks',
  ayudaMazos: 'quizGenerator.fields.decksHelp',
  sinMazosCurso: 'quizGenerator.fields.noDecks',
  etiquetaTitulo: 'quizGenerator.fields.quizTitle',
  placeholderTitulo: 'quizGenerator.fields.titlePlaceholder',
  etiquetaApertura: 'quizGenerator.fields.opening',
  etiquetaCierre: 'quizGenerator.fields.closing',
  etiquetaTiempo: 'quizGenerator.fields.timeLimit',
  etiquetaCantidad: 'quizGenerator.fields.questionCount',
  ayudaCantidad: 'quizGenerator.fields.questionCountHelp',

  // Acciones y estados
  botonGenerar: 'quizGenerator.actions.generate',
  botonGenerando: 'quizGenerator.actions.generating',
  cargandoCursos: 'quizGenerator.loading.courses',
  cargandoMazos: 'quizGenerator.loading.decks',
  errorCursos: 'quizGenerator.errors.loadCourses',
  errorMazos: 'quizGenerator.errors.loadDecks',
  errorGenerico: 'quizGenerator.errors.generic',
  sesionVencida: 'quizGenerator.errors.sessionExpired',
  sinPermiso: 'quizGenerator.errors.notTeacher',

  // Resultado. Las claves del objeto son los estados que devuelve el backend (no se traducen).
  estadoEfectivo: {
    programado: 'quizGenerator.status.scheduled',
    abierto: 'quizGenerator.status.open',
    cerrado: 'quizGenerator.status.closed',
  },
  vistaPreviaTitulo: 'quizGenerator.preview.title',
  respuestaCorrecta: 'quizGenerator.preview.correctAnswer',
};

// Claves de los mensajes de validación del formulario (ver docs/contrato-quiz.md).
// "tituloLargo" usa {{max}}, que se completa con TITULO_MAX al mostrarlo.
export const ERRORES_VALIDACION = {
  curso: 'quizValidation.course',
  mazos: 'quizValidation.decks',
  tituloVacio: 'quizValidation.titleEmpty',
  tituloLargo: 'quizValidation.titleTooLong',
  aperturaVacia: 'quizValidation.openingEmpty',
  aperturaPasada: 'quizValidation.openingPast',
  cierreVacio: 'quizValidation.closingEmpty',
  cierreAnterior: 'quizValidation.closingBeforeOpening',
  tiempoInvalido: 'quizValidation.timeInvalid',
  ventanaCorta: 'quizValidation.windowTooShort',
  cantidadInvalida: 'quizValidation.countInvalid',
};