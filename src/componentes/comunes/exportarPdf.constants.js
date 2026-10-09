export const TEXTOS_EXPORTAR_PDF = {
  cargando: 'Generando PDF…',
  sesionVencida: 'Tu sesión venció. Vuelve a iniciar sesión.',
  sinPermiso: 'Tu cuenta no tiene rol docente, así que no puede exportar a PDF.',
  errorGenerico: 'No se pudo generar el PDF. Intenta de nuevo.',
};

// Mensajes exactos que devuelve el backend en rutas protegidas
// (docs/CONTRATO_AUTENTICACION_FRONTEND.md, sección 4).
const ES_SESION_INVALIDA =
  /token de autenticación no proporcionado|token inválido o expirado/i;
const ES_SIN_PERMISO = /no tiene permisos para acceder a este recurso/i;

// Errores 400/404 de la exportación que sí son legibles para la docente
// (docs/contrato-exportacion.md). Cualquier otro mensaje (p. ej. el 500 técnico
// por caracteres que la fuente del PDF no soporta, o un fallo de red) se
// reemplaza por un mensaje genérico.
const ES_MENSAJE_LEGIBLE =
  /no encontrado|no tiene preguntas generadas|id inválido/i;

/**
 * Traduce el error de una exportación al mensaje que ve el usuario.
 * `apiRequest`/`apiDescargarArchivo` no exponen el código HTTP, solo el
 * mensaje, así que se reconoce el caso por su texto.
 *
 * @param {string|undefined} mensaje - `error.message` de la exportación.
 * @returns {{ mensaje: string, cerrarSesion: boolean }}
 */
export function clasificarErrorExportacion(mensaje) {
  if (ES_SESION_INVALIDA.test(mensaje ?? '')) {
    return { mensaje: TEXTOS_EXPORTAR_PDF.sesionVencida, cerrarSesion: true };
  }
  if (ES_SIN_PERMISO.test(mensaje ?? '')) {
    return { mensaje: TEXTOS_EXPORTAR_PDF.sinPermiso, cerrarSesion: false };
  }
  if (ES_MENSAJE_LEGIBLE.test(mensaje ?? '')) {
    return { mensaje, cerrarSesion: false };
  }
  return { mensaje: TEXTOS_EXPORTAR_PDF.errorGenerico, cerrarSesion: false };
}
