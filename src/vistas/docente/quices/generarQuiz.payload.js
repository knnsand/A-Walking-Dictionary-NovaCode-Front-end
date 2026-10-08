/**
 * Convierte los datos del formulario en el cuerpo de POST /api/v1/quizzes/generate.
 * Los nombres de campo siguen el contrato del backend
 * (docs/CONTRATO_FRONTEND_HU-3.1.md): mazo_ids, no mazos_ids.
 *
 * Debe llamarse solo con datos que ya pasaron validarFormularioQuiz.
 *
 * @param {Object} datos
 * @param {string|number} datos.cursoId
 * @param {number[]} datos.mazosSeleccionados
 * @param {Object} datos.form - valores tal como los entrega el formulario.
 * @returns {Object} cuerpo listo para generarQuiz(). Las fechas van en ISO 8601
 *   UTC; cantidad_preguntas solo se incluye si se escribió.
 */
export function construirPayloadQuiz({ cursoId, mazosSeleccionados, form }) {
  const payload = {
    curso_id: Number(cursoId),
    titulo: form.titulo.trim(),
    mazo_ids: mazosSeleccionados.map(Number),
    // datetime-local entrega hora local; toISOString() la convierte a UTC.
    fecha_apertura: new Date(form.fecha_apertura).toISOString(),
    fecha_cierre: new Date(form.fecha_cierre).toISOString(),
    tiempo_limite_min: Number(form.tiempo_limite_min),
  };

  // Campo opcional: si queda vacío no se envía y el backend genera una
  // pregunta por cada tarjeta aprobada.
  const cantidad = String(form.cantidad_preguntas ?? '').trim();
  if (cantidad !== '') {
    payload.cantidad_preguntas = Number(cantidad);
  }

  return payload;
}