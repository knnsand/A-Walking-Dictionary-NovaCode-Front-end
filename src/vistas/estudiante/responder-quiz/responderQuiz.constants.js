// vistas/estudiante/responder-quiz/responderQuiz.constants.js
// Textos de la pantalla de HU-3.2 (responder quiz y recibir nota).

export const TEXTOS = {
  tituloPagina: 'Responder quiz',
  descripcionPagina: 'Resuelve el quiz asignado antes de que se agote el tiempo.',

  // Portada del quiz
  etiquetaTiempo: 'Tiempo límite',
  etiquetaApertura: 'Apertura',
  etiquetaCierre: 'Cierre',
  etiquetaEstado: 'Estado',
  botonIniciar: 'Iniciar',
  avisoInicio:
    'Al pulsar «Iniciar» comienza el cronómetro. Solo puedes enviar el quiz una vez.',
  disponibleEl: 'Disponible el',
  cerroEl: 'Este quiz cerró el',

  estadoEfectivo: {
    programado: 'Programado',
    abierto: 'Abierto',
    cerrado: 'Cerrado',
  },
};

// Valores que devuelve el backend en `estado_efectivo` (CONTRATO_FRONTEND_HU-3.1.md).
export const ESTADO = {
  PROGRAMADO: 'programado',
  ABIERTO: 'abierto',
  CERRADO: 'cerrado',
};


// Formulario del quiz (preguntas, cronómetro y envío)
export const TEXTOS_FORMULARIO = {
  tiempoRestante: 'Tiempo restante',
  contestadas: 'Contestadas',
  botonFinalizar: 'Finalizar examen',
  botonEnviando: 'Enviando…',
  tiempoAgotado:
    'Se agotó el tiempo. Se envían las respuestas contestadas hasta este momento.',

  // Confirmación cuando faltan preguntas por contestar
  faltaUna: 'Te falta 1 pregunta por contestar.',
  faltanVarias: 'Te faltan {n} preguntas por contestar.',
  avisoSinContestar: 'Las preguntas sin contestar cuentan como incorrectas.',
  botonVolver: 'Volver al quiz',
  botonEnviarIgual: 'Enviar de todas formas',
};


// Pantalla de resultado (CA-3.2.2 y CA-3.2.3)
export const TEXTOS_RESULTADO = {
  titulo: 'Resultado',
  yaEnviado:
    'Ya enviaste este quiz y no se permite un nuevo intento. Este es el resultado de tu envío.',
  etiquetaCalificacion: 'Calificación',
  etiquetaAciertos: 'Aciertos',
  etiquetaErrores: 'Errores',
  etiquetaTiempo: 'Tiempo empleado',
  de: 'de',
  detalleTitulo: 'Detalle por pregunta',
  tuRespuesta: 'Tu respuesta',
  correcta: 'Correcta',
  incorrecta: 'Incorrecta',
  sinContestar: 'Sin contestar',
  sinDetalle: 'No se pudo cargar el detalle de las preguntas.',
  botonVolver: 'Volver al panel',
};

// Contenedor de la pantalla (carga y errores)
export const TEXTOS_CONTENEDOR = {
  cargando: 'Cargando el quiz…',
  reintentar: 'Reintentar',
  errorGenerico: 'Ocurrió un error inesperado. Intenta de nuevo.',
};