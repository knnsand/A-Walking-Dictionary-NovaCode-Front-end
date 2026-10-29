/**
 * @file ResultadoQuiz.jsx
 * @brief HU-3.2: pantalla de resultado. Muestra la nota, el desglose de aciertos y errores
 * (CA-3.2.2) y, si el estudiante ya había enviado, avisa que no hay nuevo intento
 * y muestra el resumen del envío anterior (CA-3.2.3).
 *
 * El backend no devuelve la respuesta correcta de cada pregunta
 * (CONTRATO_FRONTEND_HU-3.2.md), así que el detalle solo indica si cada
 * respuesta fue correcta, incorrecta o quedó sin contestar.
 *
 * No consulta nada por su cuenta: recibe el resultado y, si los tiene, los
 * enunciados de las preguntas.
 */

import { useTranslation } from 'react-i18next';
import { TEXTOS_RESULTADO_CLAVES as T } from './responderQuiz.constants';
import { formatearTiempo } from './responderQuiz.format';
import { ordenarPreguntas } from './responderQuiz.payload';
import './responder-quiz.css';

/** @brief Clave de traducción de cada estado interno de una respuesta. */
const ETIQUETA_ESTADO = {
  correcta: T.correcta,
  incorrecta: T.incorrecta,
  sin: T.sinContestar,
};

/**
 * @brief Estado de una respuesta: 'correcta' | 'incorrecta' | 'sin' (una pregunta sin
 * contestar cuenta como incorrecta).
 * @param {Object} [respuesta] - Fila de `respuestas` del submit.
 * @return {string}
 */
function estadoDeRespuesta(respuesta) {
  if (!respuesta || respuesta.respuesta_estudiante == null) return 'sin';
  return respuesta.es_correcta ? 'correcta' : 'incorrecta';
}

/**
 * @brief Muestra la nota del quiz y el detalle de cada respuesta.
 * @param {Object}   props
 * @param {Object}   props.resultado   `resultado` del submit (201 o 409).
 * @param {Array}    props.respuestas  `respuestas` del submit: una fila por pregunta.
 * @param {Array|null} [props.preguntas] Respuesta de GET /quizzes/:id/preguntas, para
 *   mostrar los enunciados. Si es null, solo se muestra el resumen.
 * @param {string}   [props.titulo]    Título del quiz.
 * @param {boolean}  [props.yaEnviado] true si el backend respondió 409 (CA-3.2.3).
 * @param {Function} [props.onVolver]  Si se pasa, se muestra el botón para salir.
 * @return {JSX.Element}
 */
export function ResultadoQuiz({
  resultado,
  respuestas,
  preguntas = null,
  titulo,
  yaEnviado = false,
  onVolver,
}) {
  const { t } = useTranslation();
  const total = Number(resultado.puntaje_maximo);
  const aciertos = Number(resultado.puntaje_obtenido);
  const errores = Math.max(0, total - aciertos);

  const nota = Number(resultado.calificacion);
  const textoNota = Number.isFinite(nota) ? nota.toFixed(2) : '—';

  const segundos = Number(resultado.tiempo_empleado_seg);
  const textoTiempo = Number.isFinite(segundos) ? formatearTiempo(segundos) : '—';

  const respuestaPorPregunta = new Map(respuestas.map((r) => [r.pregunta_id, r]));
  const detalle = preguntas
    ? ordenarPreguntas(preguntas).map((pregunta) => {
        const respuesta = respuestaPorPregunta.get(pregunta.id_pregunta);
        return { pregunta, respuesta, estado: estadoDeRespuesta(respuesta) };
      })
    : null;

  return (
    <section className="resultado-quiz" aria-labelledby="resultado-quiz-titulo">
      <header className="resultado-quiz__cabecera">
        <h2 id="resultado-quiz-titulo" className="resultado-quiz__titulo">
          {t(T.titulo)}
        </h2>
        {titulo && <p className="resultado-quiz__quiz">{titulo}</p>}
      </header>

      {yaEnviado && (
        <p className="resultado-quiz__aviso" role="status">
          {t(T.yaEnviado)}
        </p>
      )}

      <div className="resultado-quiz__nota">
        <span className="resultado-quiz__nota-etiqueta">{t(T.etiquetaCalificacion)}</span>
        <span className="resultado-quiz__nota-valor">{textoNota}</span>
      </div>

      <dl className="resultado-quiz__datos">
        <div>
          <dt>{t(T.etiquetaAciertos)}</dt>
          <dd>{t(T.deTotal, { value: aciertos, total })}</dd>
        </div>
        <div>
          <dt>{t(T.etiquetaErrores)}</dt>
          <dd>{t(T.deTotal, { value: errores, total })}</dd>
        </div>
        <div>
          <dt>{t(T.etiquetaTiempo)}</dt>
          <dd>{textoTiempo}</dd>
        </div>
      </dl>

      {detalle ? (
        <section aria-labelledby="resultado-quiz-detalle">
          <h3 id="resultado-quiz-detalle" className="resultado-quiz__subtitulo">
            {t(T.detalleTitulo)}
          </h3>
          <ol className="resultado-quiz__lista">
            {detalle.map(({ pregunta, respuesta, estado }) => (
              <li
                key={pregunta.id_pregunta}
                className={`resultado-quiz__item resultado-quiz__item--${estado}`}
              >
                <p className="resultado-quiz__enunciado">{pregunta.enunciado}</p>
                {estado !== 'sin' && (
                  <p className="resultado-quiz__respuesta">
                    {t(T.tuRespuesta, { answer: respuesta.respuesta_estudiante })}
                  </p>
                )}
                <p className="resultado-quiz__estado">{t(ETIQUETA_ESTADO[estado])}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <p className="resultado-quiz__sin-detalle">{t(T.sinDetalle)}</p>
      )}

      {onVolver && (
        <div className="resultado-quiz__acciones">
          <button type="button" className="btn btn-primary" onClick={onVolver}>
            {t(T.botonVolver)}
          </button>
        </div>
      )}
    </section>
  );
}