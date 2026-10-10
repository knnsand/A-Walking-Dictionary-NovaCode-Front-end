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