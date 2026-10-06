/**
 * Coautoría: un estudiante distinto (no el autor original de la
 * tarjeta) aporta una cita, ejemplo u otro significado adicional
 * para una palabra que otro compañero ya reportó previamente.
 *
 * Este archivo simula el backend en memoria mientras el endpoint
 * real (/coauthorships/*) no esté desplegado. Ver coautoriaApi.js
 * para el interruptor mock/API real (VITE_USE_MOCK).
 *
 * IMPORTANTE: `coautorias` es un array mutable a nivel de módulo,
 * no un estado de React. Vive solo en memoria del navegador: se
 * reinicia cada vez que se recarga la página o se reinicia el
 * servidor de desarrollo.
 */
let coautorias = [
  {
    id_coautoria: 1,
    palabra: 'Bildungsroman',
    tipo_gramatical: 'Noun',
    // Etiqueta libre puesta por el estudiante para nombrar su aporte
    // específico dentro del campo semántico de la palabra base.
    etiqueta: 'FEMALE BILDUNGSROMAN',
    // "sentido": el significado o matiz adicional que el estudiante
    // propone para la palabra (no reemplaza la definición original,
    // la complementa).
    sentido: 'Variante de la novela de formación enfocada en los obstáculos específicos de género y autonomía social en la heroína victoriana.',
    texto_cita: 'I am no bird; and no net ensnares me; I am a free human being with an independent will.',
    fuente: 'Jane Eyre (1847) (Charlotte Brontë)',
    estudiante: 'Mateo Rodríguez',
    // Estados posibles: 'pendiente_revision' | 'aprobada' | 'rechazada'
    estado: 'pendiente_revision',
  },
  {
    id_coautoria: 2,
    palabra: 'Serendipity',
    tipo_gramatical: 'Noun',
    etiqueta: 'TEXTUAL SERENDIPITY',
    sentido: 'El hallazgo afortunado de una clave hermenéutica o manuscrito extraviado que reordena el sentido de la trama.',
    texto_cita: "By mere serendipity among the damp folios, the forgotten confession revealed Frankenstein's true descent.",
    fuente: 'Critical Notes on Romanticism (Prof. J. Sterling)',
    estudiante: 'Lucía Gómez',
    estado: 'pendiente_revision',
  },
];

/**
 * Devuelve solo las coautorías que aún no han sido revisadas por
 * la docente. Es lo que alimenta la pestaña "Coautoría" del panel
 * de revisión (equivalente a mockListarPendientes() en tarjetasMock.js,
 * pero para coautorías en vez de tarjetas nuevas).
 */
export function mockListarCoautoriasPendientes() {
  return coautorias.filter((c) => c.estado === 'pendiente_revision');
}

/**
 * Aprueba una coautoría, aplicando de paso cualquier corrección que
 * la docente haya hecho en modo edición (gramática, ortografía, etc.).
 *
 * @param {number} idCoautoria - id_coautoria de la coautoría a aprobar.
 * @param {object} datosEditados - Campos corregidos (sentido, texto_cita,
 *   fuente). Si la docente aprobó sin editar, llega como objeto vacío.
 * @returns {object} La coautoría ya actualizada, con estado 'aprobada'.
 */
export function mockAprobarCoautoria(idCoautoria, datosEditados = {}) {
  // .map() reconstruye el array completo: solo el objeto cuyo id
  // coincide se reemplaza (con sus campos originales + los editados
  // + el nuevo estado); el resto de coautorías queda igual.
  coautorias = coautorias.map((c) =>
    c.id_coautoria === idCoautoria ? { ...c, ...datosEditados, estado: 'aprobada' } : c
  );
  return coautorias.find((c) => c.id_coautoria === idCoautoria);
}

/**
 * Rechaza una coautoría: se usa cuando el contenido aportado
 * (cita, ejemplo o significado) NO concuerda con la palabra a la
 * que se está intentando asociar. A diferencia de las tarjetas
 * nuevas (donde se quitó "Rechazar" por falta de criterio claro),
 * aquí el criterio de rechazo sí es explícito.
 *
 * @param {number} idCoautoria - id_coautoria de la coautoría a rechazar.
 * @returns {object} Objeto mínimo confirmando el nuevo estado
 *   (no se retorna la coautoría completa porque, a diferencia de
 *   aprobar, rechazar no requiere mostrar sus datos actualizados).
 */
export function mockRechazarCoautoria(idCoautoria) {
  coautorias = coautorias.map((c) =>
    c.id_coautoria === idCoautoria ? { ...c, estado: 'rechazada' } : c
  );
  return { id_coautoria: idCoautoria, estado: 'rechazada' };
}