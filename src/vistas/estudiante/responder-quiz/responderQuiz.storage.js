// vistas/estudiante/responder-quiz/responderQuiz.storage.js
// HU-3.2: respaldo del intento en curso en `sessionStorage`.
//
// Guarda el momento de inicio y las respuestas elegidas, para que una recarga de
// la página no reinicie el reloj ni borre lo contestado (CONTRATO_FRONTEND_HU-3.2.md,
// sección Temporizador). Todo va en una sola clave por quiz.
//
// `sessionStorage` puede no estar disponible o fallar (navegación privada, cuota
// llena, datos de sitio bloqueados), por eso cada acceso va dentro de try/catch:
// si falla, el quiz sigue funcionando, solo sin respaldo.

const clave = (idQuiz) => `quiz_${idQuiz}_borrador`;

/**
 * @param {number|string} idQuiz
 * @returns {{ fechaInicio: string, respuestas: Object<string, string> } | null}
 *   `respuestas` es { [pregunta_id]: texto de la opción elegida }. Devuelve null si
 *   no hay borrador o si está dañado.
 */
export function leerBorrador(idQuiz) {
  try {
    const crudo = sessionStorage.getItem(clave(idQuiz));
    if (!crudo) return null;

    const dato = JSON.parse(crudo);
    if (!dato || typeof dato.fechaInicio !== 'string') return null;

    const respuestas =
      dato.respuestas && typeof dato.respuestas === 'object' ? dato.respuestas : {};
    return { fechaInicio: dato.fechaInicio, respuestas };
  } catch {
    return null;
  }
}

/**
 * @param {number|string} idQuiz
 * @param {{ fechaInicio: string, respuestas: Object<string, string> }} borrador
 */
export function guardarBorrador(idQuiz, { fechaInicio, respuestas }) {
  try {
    sessionStorage.setItem(clave(idQuiz), JSON.stringify({ fechaInicio, respuestas }));
  } catch {
    // Sin almacenamiento disponible: el intento sigue sin respaldo.
  }
}

/** Elimina el borrador de un quiz (por ejemplo, después de enviarlo). */
export function borrarBorrador(idQuiz) {
  try {
    sessionStorage.removeItem(clave(idQuiz));
  } catch {
    // Nada que borrar si el almacenamiento no está disponible.
  }
}


// ---------------------------------------------------------------------------
// Resultado ya enviado (CA-3.2.3)
//
// RESPALDO TEMPORAL: el backend solo devuelve el resumen de un envío anterior
// como respuesta a un reenvío (409), y no lo devuelve si el quiz ya cerró.
// Mientras no exista un endpoint para consultar el resultado previo, se recuerda
// aquí para poder mostrarlo al reabrir el enlace del quiz. Solo funciona en el
// mismo navegador; si el endpoint llega, este respaldo pasa a ser secundario.
//
// Se usa `localStorage` para que sobreviva al cierre de la pestaña. La clave
// incluye al estudiante porque cerrar sesión no borra otras claves, y en un
// computador compartido el siguiente estudiante vería el resultado del anterior.
// ---------------------------------------------------------------------------

const claveResultado = (idQuiz, idEstudiante) => `quiz_${idQuiz}_resultado_${idEstudiante}`;

/**
 * Guarda el resultado de un quiz ya enviado. No hace nada si no se conoce el estudiante.
 *
 * @param {number|string} idQuiz
 * @param {number|string} idEstudiante
 * @param {{ resultado: Object, respuestas: Array }} datos Lo que devuelve el submit (201 o 409).
 */
export function guardarResultado(idQuiz, idEstudiante, { resultado, respuestas }) {
  if (!idEstudiante) return;

  try {
    localStorage.setItem(
      claveResultado(idQuiz, idEstudiante),
      JSON.stringify({ resultado, respuestas })
    );
  } catch {
    // Sin almacenamiento disponible: el resumen se obtendrá por el 409.
  }
}

/**
 * @param {number|string} idQuiz
 * @param {number|string} idEstudiante
 * @returns {{ resultado: Object, respuestas: Array } | null} null si no hay resultado
 *   guardado, si no se conoce el estudiante o si el dato está dañado.
 */
export function leerResultado(idQuiz, idEstudiante) {
  if (!idEstudiante) return null;

  try {
    const crudo = localStorage.getItem(claveResultado(idQuiz, idEstudiante));
    if (!crudo) return null;

    const dato = JSON.parse(crudo);
    const valido =
      dato &&
      typeof dato.resultado === 'object' &&
      dato.resultado !== null &&
      Array.isArray(dato.respuestas);
    return valido ? { resultado: dato.resultado, respuestas: dato.respuestas } : null;
  } catch {
    return null;
  }
}