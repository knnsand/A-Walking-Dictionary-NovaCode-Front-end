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