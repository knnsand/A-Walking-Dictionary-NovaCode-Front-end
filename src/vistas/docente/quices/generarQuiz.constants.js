export const TITULO_MAX = 200;

export const TEXTOS = {
  titulo: 'Generar Quiz Acumulativo',
  descripcion:
    'Selecciona los mazos que quieres evaluar y define la ventana de aplicación. El quiz se arma con las tarjetas aprobadas (revisadas por la docente) de esos mazos.',

  // Campos del formulario
  etiquetaCurso: 'Curso',
  placeholderCurso: 'Selecciona un curso',
  etiquetaMazos: 'Mazos a evaluar',
  ayudaMazos: 'Elige uno o más mazos del curso. Puedes seleccionar varias semanas para un quiz acumulativo.',
  sinMazosCurso: 'Este curso aún no tiene mazos.',
  etiquetaTitulo: 'Título del quiz',
  placeholderTitulo: 'Ej.: Quiz acumulativo semanas 1 a 4',
  etiquetaApertura: 'Fecha y hora de apertura',
  etiquetaCierre: 'Fecha y hora de cierre',
  etiquetaTiempo: 'Tiempo límite (minutos)',
  etiquetaCantidad: 'Cantidad de preguntas (opcional)',
  ayudaCantidad: 'Si lo dejas vacío, se genera una pregunta por cada tarjeta aprobada.',

  // Acciones y estados
  botonGenerar: 'Generar Quiz',
  botonGenerando: 'Generando…',
  cargandoCursos: 'Cargando cursos…',
  cargandoMazos: 'Cargando mazos…',
  errorCursos: 'No se pudieron cargar los cursos.',
  errorMazos: 'No se pudieron cargar los mazos.',
  errorGenerico: 'Ocurrió un error inesperado. Intenta de nuevo.',
  sesionVencida: 'Tu sesión venció. Vuelve a iniciar sesión.',
  sinPermiso: 'Tu cuenta no tiene rol docente, así que no puede generar quices.',

  // Resultado
  exitoTitulo: 'Quiz generado',
  estadoEfectivo: {
    programado: 'Programado',
    abierto: 'Abierto',
    cerrado: 'Cerrado',
  },
  vistaPreviaTitulo: 'Vista previa (solo docente)',
  respuestaCorrecta: 'Respuesta correcta',

  // Exportar a PDF (HU-3.3)
  botonExportarQuiz: 'Exportar versión impresa',
  listaQuicesTitulo: 'Quices generados',
  listaQuicesDescripcion:
    'Descarga el PDF imprimible de un quiz: la hoja de preguntas y, en página aparte, la hoja de respuestas para la docente.',
  cargandoQuices: 'Cargando quices…',
  errorQuices: 'No se pudieron cargar los quices.',
  sinQuices: 'Todavía no se ha generado ningún quiz.',
};

// Mensajes de validación del formulario (ver docs/contrato-quiz.md).
export const ERRORES_VALIDACION = {
  curso: 'Selecciona un curso.',
  mazos: 'Selecciona al menos un mazo.',
  tituloVacio: 'Escribe un título para el quiz.',
  tituloLargo: `El título no puede superar los ${TITULO_MAX} caracteres.`,
  aperturaVacia: 'Indica la fecha y hora de apertura.',
  aperturaPasada: 'La apertura debe ser posterior a la hora actual.',
  cierreVacio: 'Indica la fecha y hora de cierre.',
  cierreAnterior: 'El cierre debe ser posterior a la apertura.',
  tiempoInvalido: 'El tiempo límite debe ser un número entero mayor o igual a 1.',
  ventanaCorta: 'La ventana entre apertura y cierre debe ser al menos igual al tiempo límite.',
  cantidadInvalida: 'La cantidad de preguntas debe ser un número entero mayor o igual a 1.',
};