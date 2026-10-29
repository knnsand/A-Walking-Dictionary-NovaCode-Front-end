/**
 * @file responderQuiz.storage.js
 * @brief HU-3.2: respaldo del intento en curso en `sessionStorage`.
 *
 * Guarda el momento de inicio y las respuestas elegidas, para que una recarga de
 * la página no reinicie el reloj ni borre lo contestado (CONTRATO_FRONTEND_HU-3.2.md,
 * sección Temporizador). Todo va en una sola clave por quiz.
 *
 * `sessionStorage` puede no estar disponible o fallar (navegación privada, cuota
 * llena, datos de sitio bloqueados), por eso cada acceso va dentro de try/catch:
 * si falla, el quiz sigue funcionando, solo sin respaldo.
 */

/** @brief Clave de sessionStorage del borrador de un quiz. */
const clave = (idQuiz) => `quiz_${idQuiz}_borrador`;

/**
 * @brief Lee el borrador del intento en curso.
 * @param {number|string} idQuiz - Id del quiz.
 * @return {{ fechaInicio: string, respuestas: Object<string, string> } | null}
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
 * @brief Guarda el borrador del intento en curso.
 * @param {number|string} idQuiz - Id del quiz.
 * @param {{ fechaInicio: string, respuestas: Object<string, string> }} borrador - Hora de inicio y respuestas.
 */
export function guardarBorrador(idQuiz, { fechaInicio, respuestas }) {
  try {
    sessionStorage.setItem(clave(idQuiz), JSON.stringify({ fechaInicio, respuestas }));
  } catch {
    // Sin almacenamiento disponible: el intento sigue sin respaldo.
  }
}

/**
 * @brief Elimina el borrador de un quiz (por ejemplo, después de enviarlo).
 * @param {number|string} idQuiz - Id del quiz.
 */
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

/** @brief Clave de localStorage del resultado de un quiz para un estudiante. */
const claveResultado = (idQuiz, idEstudiante) => `quiz_${idQuiz}_resultado_${idEstudiante}`;

/**
 * @brief Guarda el resultado de un quiz ya enviado. No hace nada si no se conoce el estudiante.
 *
 * @param {number|string} idQuiz
 * @param {number|string} idEstudiante
 * @param {{ resultado: Object, respuestas: Array, preguntas?: Array }} datos Lo que devuelve
 *   el submit (201 o 409) y, si se tienen, las preguntas tal como las entregó
 *   GET /quizzes/:id/preguntas (sin respuesta correcta), para poder mostrar el detalle
 *   aunque el quiz ya haya cerrado.
 */
export function guardarResultado(idQuiz, idEstudiante, { resultado, respuestas, preguntas }) {
  if (!idEstudiante) return;

  try {
    localStorage.setItem(
      claveResultado(idQuiz, idEstudiante),
      JSON.stringify({ resultado, respuestas, preguntas: preguntas ?? null })
    );
  } catch {
    // Sin almacenamiento disponible: el resumen se obtendrá por el 409.
  }
}

/**
 * @brief Lee el resultado guardado de un quiz ya enviado.
 * @param {number|string} idQuiz - Id del quiz.
 * @param {number|string} idEstudiante - Id del estudiante.
 * @return {{ resultado: Object, respuestas: Array, preguntas: Array|null } | null}
 *   null si no hay resultado guardado, si no se conoce el estudiante o si el dato está
 *   dañado. `preguntas` es null si no se guardaron.
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
    if (!valido) return null;

    return {
      resultado: dato.resultado,
      respuestas: dato.respuestas,
      preguntas: Array.isArray(dato.preguntas) ? dato.preguntas : null,
    };
  } catch {
    return null;
  }
}