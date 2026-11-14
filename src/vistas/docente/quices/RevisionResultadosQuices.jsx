
/**
 * @file RevisionResultadosQuices.jsx
 * @brief HU-022: panel docente de revisión de resultados de quices.
 */

import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  obtenerResultadosQuizDocente,
  obtenerRespuestasQuizDocente,
} from '../../../cliente-api/revisionResultadosQuicesApi';

import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';

import './revision-resultados-quices.css';

export function RevisionResultadosQuices() {
  const { idQuiz } = useParams();
  const { t } = useTranslation();

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [reintento, setReintento] = useState(0);

  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState(null);
  const [resultadoSeleccionado, setResultadoSeleccionado] = useState(null);
  // HU-022: permite desplazarse automáticamente al detalle de respuestas.
  const detalleRef = useRef(null);

  useEncabezadoPagina(
    t('quizResults.title'),
    t('quizResults.description')
  );

  // CA-22.2: cargar estadísticas y resultados del quiz.
  useEffect(() => {
    let cancelado = false;

    obtenerResultadosQuizDocente(idQuiz)
      .then((respuesta) => {
        if (cancelado) return;
        setDatos(respuesta);
        setError(null);
      })
      .catch(() => {
        if (!cancelado) {
          setError(t('quizResults.loadError'));
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idQuiz, reintento, t]);

  // CA-22.3: al seleccionar un resultado, mostrar su detalle.

/**
 * @brief HU-022 CA-22.3:
 * desplaza la pantalla al detalle cuando termina de cargar.
 */
useEffect(() => {
  if (!detalle || !resultadoSeleccionado) return;

  detalleRef.current?.scrollIntoView({
    behavior: 'auto',
    block: 'start',
    inline: 'nearest',
  });
}, [detalle, resultadoSeleccionado]);


  // CA-22.3: consultar las respuestas de un estudiante.
  async function verRespuestas(resultado) {
    setResultadoSeleccionado(resultado);
    setDetalle(null);
    setErrorDetalle(null);
    setCargandoDetalle(true);

    try {
      const respuesta = await obtenerRespuestasQuizDocente(
        idQuiz,
        resultado.id_resultado
      );

      setDetalle(respuesta);
    } catch {
      setErrorDetalle(t('quizResults.detailError'));
    } finally {
      setCargandoDetalle(false);
    }
  }

  function reintentar() {
    setDatos(null);
    setError(null);
    setCargando(true);
    setReintento((anterior) => anterior + 1);
  }

  function formatearNota(valor) {
    if (valor === null || valor === undefined) return '—';

    return Number(valor).toFixed(2);
  }

  function formatearTiempo(segundos) {
    if (segundos === null || segundos === undefined) return '—';

    const minutos = Math.floor(Number(segundos) / 60);
    const restantes = Number(segundos) % 60;

    return `${minutos}m ${restantes}s`;
  }

  function formatearFecha(fecha) {
    if (!fecha) return '—';

    return new Date(fecha).toLocaleString();
  }

  return (
    <section className="revision-quices">
      <Link
        to="/docente/quices"
        className="btn btn-secondary"
      >
        {t('quizResults.back')}
      </Link>

      {cargando && (
        <p role="status">
          {t('quizResults.loading')}
        </p>
      )}

      {error && (
        <div role="alert" className="revision-quices__error">
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={reintentar}
          >
            {t('quizResults.retry')}
          </button>
        </div>
      )}

      {!cargando && !error && datos && (
        <>
          <div className="revision-quices__encabezado">
            <h2>{datos.quiz?.titulo}</h2>
            <p>{datos.quiz?.nombre_curso}</p>
          </div>

          {/* CA-22.2: estadísticas generales. */}
          <div className="revision-quices__estadisticas">
            <article className="revision-quices__indicador">
              <span>{t('quizResults.participants')}</span>
              <strong>{datos.estadisticas?.participantes ?? 0}</strong>
            </article>

            <article className="revision-quices__indicador">
              <span>{t('quizResults.average')}</span>
              <strong>
                {formatearNota(datos.estadisticas?.promedio)}
              </strong>
            </article>

            <article className="revision-quices__indicador">
              <span>{t('quizResults.maxGrade')}</span>
              <strong>
                {formatearNota(datos.estadisticas?.nota_maxima)}
              </strong>
            </article>

            <article className="revision-quices__indicador">
              <span>{t('quizResults.minGrade')}</span>
              <strong>
                {formatearNota(datos.estadisticas?.nota_minima)}
              </strong>
            </article>

            <article className="revision-quices__indicador">
              <span>{t('quizResults.participation')}</span>
              <strong>
                {datos.estadisticas?.porcentaje_participacion ?? 0}%
              </strong>
            </article>
          </div>

          {/* CA-22.2: resultados individuales. */}
          <div className="revision-quices__seccion">
            <h3>{t('quizResults.individualResults')}</h3>

            {datos.estadisticas?.participantes === 0 && (
              <p className="empty-state">
                {t('quizResults.noResults')}
              </p>
            )}

            <div className="revision-quices__tabla-contenedor">
              <table className="revision-quices__tabla">
                <thead>
                  <tr>
                    <th>{t('quizResults.student')}</th>
                    <th>{t('quizResults.grade')}</th>
                    <th>{t('quizResults.score')}</th>
                    <th>{t('quizResults.time')}</th>
                    <th>{t('quizResults.submittedAt')}</th>
                    <th>{t('quizResults.actions')}</th>
                  </tr>
                </thead>

                <tbody>
                  {(datos.resultados ?? []).map((resultado) => (
                    <tr key={resultado.estudiante_id}>
                      <td>{resultado.estudiante}</td>
                      <td>
                        {resultado.presento
                          ? formatearNota(resultado.calificacion)
                          : t('quizResults.notSubmitted')}
                      </td>
                      <td>
                        {resultado.presento
                          ? `${resultado.puntaje_obtenido}/${resultado.puntaje_maximo}`
                          : '—'}
                      </td>
                      <td>
                        {formatearTiempo(resultado.tiempo_empleado_seg)}
                      </td>
                      <td>
                        {formatearFecha(resultado.fecha_envio)}
                      </td>
                      <td>
                        {resultado.presento && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => verRespuestas(resultado)}
                          >
                            {t('quizResults.viewAnswers')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CA-22.2: dificultad de las preguntas. */}
          <div className="revision-quices__seccion">
            <h3>{t('quizResults.questionDifficulty')}</h3>

            {(datos.dificultad_preguntas ?? []).length === 0 ? (
              <p>{t('quizResults.noDifficulty')}</p>
            ) : (
              <div className="revision-quices__dificultad">
                {(datos.dificultad_preguntas ?? []).map((pregunta) => (
                  <article
                    key={pregunta.id_pregunta}
                    className="revision-quices__pregunta"
                  >
                    <p>{pregunta.enunciado}</p>

                    <strong>
                      {pregunta.porcentaje_error === null
                        ? '—'
                        : `${pregunta.porcentaje_error}%`}
                    </strong>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* CA-22.3: respuestas del estudiante seleccionado. */}
          {resultadoSeleccionado && (
             <div
              ref={detalleRef}
              className="revision-quices__seccion revision-quices__seccion--detalle">
              <h3>
                {t('quizResults.answersOf')}: {resultadoSeleccionado.estudiante}
              </h3>

              {cargandoDetalle && (
                <p role="status">
                  {t('quizResults.loadingAnswers')}
                </p>
              )}

              {errorDetalle && (
                <p role="alert" className="revision-quices__error">
                  {errorDetalle}
                </p>
              )}

              {detalle && (
                <div className="revision-quices__respuestas">
                  {(detalle.preguntas ?? []).map((pregunta) => (
                    <article
                      key={pregunta.id_pregunta}
                      className="revision-quices__pregunta"
                    >
                      <h4>
                        {t('quizResults.question')} {pregunta.orden}
                      </h4>

                      <p>{pregunta.enunciado}</p>

                      <p>
                        <strong>{t('quizResults.studentAnswer')}:</strong>{' '}
                        {pregunta.respuesta_estudiante
                          ?? t('quizResults.unanswered')}
                      </p>

                      <p>
                        <strong>{t('quizResults.correctAnswer')}:</strong>{' '}
                        {pregunta.respuesta_correcta}
                      </p>

                      <span
                        className={
                          pregunta.es_correcta
                            ? 'revision-quices__correcta'
                            : 'revision-quices__incorrecta'
                        }
                      >
                        {pregunta.es_correcta
                          ? t('quizResults.correct')
                          : t('quizResults.incorrect')}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
