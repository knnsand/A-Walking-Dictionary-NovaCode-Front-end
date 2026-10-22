// Claves de traducción de los textos del botón (el texto vive en src/i18n/locales/en.json).
export const TEXTOS_EXPORTAR_PDF = {
  cargando: 'pdfExport.loading',
  sesionVencida: 'pdfExport.errors.sessionExpired',
  sinPermiso: 'pdfExport.errors.notTeacher',
  errorGenerico: 'pdfExport.errors.generic',
};

// Mensajes exactos que devuelve el backend en rutas protegidas
// (docs/CONTRATO_AUTENTICACION_FRONTEND.md, sección 4).
// NO TRADUCIR: se comparan contra el texto en español que envía el backend.
const ES_SESION_INVALIDA =
  /token de autenticación no proporcionado|token inválido o expirado/i;
const ES_SIN_PERMISO = /no tiene permisos para acceder a este recurso/i;

// Errores 400/404 de la exportación que sí son legibles para la docente
// (docs/contrato-exportacion.md). Cualquier otro mensaje (p. ej. el 500 técnico
// por caracteres que la fuente del PDF no soporta, o un fallo de red) se
// reemplaza por un mensaje genérico.
// NO TRADUCIR: se comparan contra el texto en español que envía el backend.
const ES_MENSAJE_LEGIBLE =
  /no encontrado|no tiene preguntas generadas|id inválido/i;

/**
 * Traduce el error de una exportación al mensaje que ve el usuario.
 * `apiRequest`/`apiDescargarArchivo` no exponen el código HTTP, solo el
 * mensaje, así que se reconoce el caso por su texto.
 *
 * Devuelve `clave` (clave de traducción, para pasar por `t()`) cuando el texto
 * lo define el front, o `mensaje` (texto del backend, tal cual) cuando es un error
 * legible que envía el servidor. Siempre viene uno de los dos.
 *
 * @param {string|undefined} mensaje - `error.message` de la exportación.
 * @returns {{ clave?: string, mensaje?: string, cerrarSesion: boolean }}
 */
export function clasificarErrorExportacion(mensaje) {
  if (ES_SESION_INVALIDA.test(mensaje ?? '')) {
    return { clave: TEXTOS_EXPORTAR_PDF.sesionVencida, cerrarSesion: true };
  }
  if (ES_SIN_PERMISO.test(mensaje ?? '')) {
    return { clave: TEXTOS_EXPORTAR_PDF.sinPermiso, cerrarSesion: false };
  }
  if (ES_MENSAJE_LEGIBLE.test(mensaje ?? '')) {
    return { mensaje, cerrarSesion: false };
  }
  return { clave: TEXTOS_EXPORTAR_PDF.errorGenerico, cerrarSesion: false };
}
