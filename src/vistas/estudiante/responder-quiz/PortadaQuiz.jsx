// vistas/estudiante/responder-quiz/PortadaQuiz.jsx
// HU-3.2: portada del quiz. Muestra los datos y el botón "Iniciar", que solo se
// habilita si el quiz está abierto (CONTRATO_FRONTEND_HU-3.2.md, sección Pantallas).
//
// Solo presenta los datos que recibe; quien la use se encarga de consultarlos.

import { ESTADO, TEXTOS } from './responderQuiz.constants';
import { formatearFecha, textoMinutos } from './responderQuiz.format';
import './responder-quiz.css';

/**
 * @param {Object}   props
 * @param {Object}   props.quiz      Respuesta de GET /quizzes/:id (usa `estado_efectivo`).
 * @param {Function} props.onIniciar Se llama al pulsar "Iniciar".
 */
export function PortadaQuiz({ quiz, onIniciar }) {
  const estado = quiz.estado_efectivo;
  const abierto = estado === ESTADO.ABIERTO;

  return (
    <section className="portada-quiz" aria-labelledby="portada-quiz-titulo">
      <header className="portada-quiz__cabecera">
        <h2 id="portada-quiz-titulo" className="portada-quiz__titulo">
          {quiz.titulo}
        </h2>
        <span className={`portada-quiz__estado portada-quiz__estado--${estado}`}>
          {TEXTOS.estadoEfectivo[estado] ?? estado}
        </span>
      </header>

      <dl className="portada-quiz__datos">
        <div>
          <dt>{TEXTOS.etiquetaTiempo}</dt>
          <dd>{textoMinutos(quiz.tiempo_limite_min)}</dd>
        </div>
        <div>
          <dt>{TEXTOS.etiquetaApertura}</dt>
          <dd>{formatearFecha(quiz.fecha_apertura)}</dd>
        </div>
        <div>
          <dt>{TEXTOS.etiquetaCierre}</dt>
          <dd>{formatearFecha(quiz.fecha_cierre)}</dd>
        </div>
      </dl>

      {estado === ESTADO.PROGRAMADO && (
        <p className="portada-quiz__mensaje">
          {`${TEXTOS.disponibleEl} ${formatearFecha(quiz.fecha_apertura)}.`}
        </p>
      )}

      {estado === ESTADO.CERRADO && (
        <p className="portada-quiz__mensaje">
          {`${TEXTOS.cerroEl} ${formatearFecha(quiz.fecha_cierre)}.`}
        </p>
      )}

      {abierto && <p className="portada-quiz__aviso">{TEXTOS.avisoInicio}</p>}

      <div className="portada-quiz__acciones">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!abierto}
          onClick={onIniciar}
        >
          {TEXTOS.botonIniciar}
        </button>
      </div>
    </section>
  );
}