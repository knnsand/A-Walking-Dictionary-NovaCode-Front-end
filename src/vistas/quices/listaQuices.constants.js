// vistas/quices/listaQuices.constants.js
// HU-009: textos y constantes de la lista de quices (docente y estudiante).

export const ESTADO = {
  PROGRAMADO: 'programado',
  ABIERTO: 'abierto',
  CERRADO: 'cerrado',
};

export const TEXTOS = {
  cargando: 'Cargando quices…',
  vacio: 'Todavía no hay quices disponibles.',
  vacioDocente: 'Todavía no se ha generado ningún quiz.',
  errorGenerico: 'No se pudieron cargar los quices.',

  semanaCorte: 'Semana de corte',
  apertura: 'Apertura',
  cierre: 'Cierre',
  tiempoLimite: 'Tiempo límite',
  respondido: 'Respondido',

  // Exportar a PDF (solo docente, HU-3.3)
  botonExportarQuiz: 'Exportar versión impresa',

  // Acciones del estudiante: llevan a /estudiante/quices/:idQuiz
  accionResponder: 'Responder quiz',
  accionResultado: 'Ver resultado',
  accionDetalle: 'Ver detalle',
};

// Título y subtítulo según quién mira la lista.
export const TEXTOS_POR_ROL = {
  estudiante: {
    titulo: 'Quices Quincenales',
    descripcion: 'Selecciona un quiz para ver su portada o responderlo.',
  },
  docente: {
    titulo: 'Quices generados',
    descripcion:
      'Consulta los quices ya creados y descarga el PDF imprimible de cualquiera: la hoja de preguntas y, en página aparte, la hoja de respuestas.',
  },
};

// Siempre se usa `estado_efectivo`, nunca `estado` (docs/contrato-quiz-estudiante.md).
export const ETIQUETA_ESTADO = {
  [ESTADO.PROGRAMADO]: 'Programado',
  [ESTADO.ABIERTO]: 'Abierto',
  [ESTADO.CERRADO]: 'Cerrado',
};

// Clase del badge de cada estado: .badge-abierto y .badge-cerrado vienen de index.css;
// "programado" no tiene en la librería global y se define en lista-quices.css.
export const CLASE_BADGE_ESTADO = {
  [ESTADO.PROGRAMADO]: 'quiz-badge--programado',
  [ESTADO.ABIERTO]: 'badge-abierto',
  [ESTADO.CERRADO]: 'badge-cerrado',
};
