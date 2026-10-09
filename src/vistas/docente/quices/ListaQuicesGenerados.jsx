import { useEffect, useState } from 'react';
import { listarQuices } from '../../../cliente-api/quizzesApi';
import { exportarQuizPdf } from '../../../cliente-api/exportacionesApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { BotonExportarPdf } from '../../../componentes/comunes/BotonExportarPdf';
import { TEXTOS } from './generarQuiz.constants';

/**
 * Lista de quices ya generados, cada uno con su botón "Exportar versión impresa"
 * (HU-3.3, CA-3.3.2). Sirve para exportar un quiz existente sin tener que
 * generarlo de nuevo. SOLO para la docente: el PDF incluye la clave de respuestas.
 *
 * @param {Object} props
 * @param {number|string} [props.refrescarTrigger] - Cuando cambia, se vuelve a cargar la
 *   lista (se usa al generar un quiz nuevo).
 */
export function ListaQuicesGenerados({ refrescarTrigger }) {
  const [quices, setQuices] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    listarQuices()
      .then((datos) => {
        if (cancelado) return;
        setQuices(Array.isArray(datos) ? datos : []);
        setError(null);
      })
      .catch(() => {
        if (!cancelado) setError(TEXTOS.errorQuices);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [refrescarTrigger]);

  // Los más recientes primero (el backend no garantiza el orden).
  const quicesOrdenados = [...quices].sort((a, b) => b.id_quiz - a.id_quiz);

  return (
    <section className="lista-quices" aria-labelledby="lista-quices-titulo">
      <h2 id="lista-quices-titulo" className="lista-quices__titulo">
        {TEXTOS.listaQuicesTitulo}
      </h2>
      <p className="lista-quices__descripcion">{TEXTOS.listaQuicesDescripcion}</p>

      <Aviso tipo="error" mensaje={error} />

      {cargando && <p>{TEXTOS.cargandoQuices}</p>}

      {!cargando && !error && quicesOrdenados.length === 0 && (
        <p className="empty-state">{TEXTOS.sinQuices}</p>
      )}

      {quicesOrdenados.length > 0 && (
        <ul className="lista-quices__lista">
          {quicesOrdenados.map((quiz) => (
            <li key={quiz.id_quiz} className="lista-quices__item">
              <div className="lista-quices__info">
                <span className="lista-quices__nombre">{quiz.titulo}</span>
                <span className="lista-quices__meta">
                  Semana {quiz.semana_corte} ·{' '}
                  {TEXTOS.estadoEfectivo[quiz.estado_efectivo] ?? quiz.estado_efectivo}
                </span>
              </div>

              <BotonExportarPdf
                onExportar={() => exportarQuizPdf(quiz.id_quiz)}
                etiqueta={TEXTOS.botonExportarQuiz}
                ariaLabel={`${TEXTOS.botonExportarQuiz} del quiz ${quiz.titulo}`}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
