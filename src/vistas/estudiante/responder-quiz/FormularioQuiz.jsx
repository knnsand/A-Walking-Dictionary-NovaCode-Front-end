// vistas/estudiante/responder-quiz/FormularioQuiz.jsx
// HU-3.2: formulario del quiz. Todas las preguntas en una página, cronómetro
// regresivo y botón "Finalizar examen" (CONTRATO_FRONTEND_HU-3.2.md).
//
// No consulta nada por su cuenta: recibe el quiz, las preguntas y la hora de
// inicio, y entrega el cuerpo del envío a `onEnviar`. El envío real y su resultado
// los maneja quien use este componente.

import { useState } from 'react';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { TEXTOS_FORMULARIO as T } from './responderQuiz.constants';
import { formatearTiempo } from './responderQuiz.format';
import {
  construirPayloadEnvio,
  contarSinContestar,
  opcionesDePregunta,
  ordenarPreguntas,
} from './responderQuiz.payload';
import { guardarBorrador } from './responderQuiz.storage';
import { useTemporizadorQuiz } from './useTemporizadorQuiz';
import './responder-quiz.css';

const LETRAS = ['A', 'B', 'C', 'D'];
const SEGUNDOS_URGENTE = 60;

/**
 * @param {Object}   props
 * @param {Object}   props.quiz        Quiz (usa id_quiz, titulo, tiempo_limite_min, fecha_cierre).
 * @param {Array}    props.preguntas   Respuesta de GET /quizzes/:id/preguntas.
 * @param {string}   props.fechaInicio ISO 8601 del momento en que se pulsó "Iniciar".
 * @param {Object<string, string>} [props.respuestasIniciales] Borrador recuperado.
 * @param {Function} props.onEnviar    Recibe el cuerpo del POST /submit.
 * @param {boolean}  [props.enviando]  true mientras el envío está en curso.
 * @param {string|null} [props.errorEnvio] Mensaje del último envío fallido.
 */
export function FormularioQuiz({
  quiz,
  preguntas,
  fechaInicio,
  respuestasIniciales = {},
  onEnviar,
  enviando = false,
  errorEnvio = null,
}) {
  const [respuestas, setRespuestas] = useState(respuestasIniciales);
  const [confirmando, setConfirmando] = useState(false);

  const preguntasOrdenadas = ordenarPreguntas(preguntas);
  const total = preguntas.length;
  const faltan = contarSinContestar({ preguntas, respuestas });

  function enviar() {
    if (enviando) return;
    setConfirmando(false);
    onEnviar(construirPayloadEnvio({ fechaInicio, preguntas, respuestas }));
  }

  // Al llegar a 0 se envía lo contestado hasta ese momento (CA-3.2.1).
  const { segundosRestantes, agotado } = useTemporizadorQuiz({
    fechaInicio,
    tiempoLimiteMin: quiz.tiempo_limite_min,
    fechaCierre: quiz.fecha_cierre,
    onTiempoAgotado: enviar,
  });

  const bloqueado = agotado || enviando;
  const urgente = segundosRestantes !== null && segundosRestantes <= SEGUNDOS_URGENTE;

  function elegir(idPregunta, texto) {
    const siguientes = { ...respuestas, [idPregunta]: texto };
    setRespuestas(siguientes);
    guardarBorrador(quiz.id_quiz, { fechaInicio, respuestas: siguientes });
  }

  function finalizar() {
    // Si faltan preguntas se pide confirmación, salvo que ya se haya agotado el tiempo.
    if (faltan > 0 && !agotado) {
      setConfirmando(true);
      return;
    }
    enviar();
  }

  const textoFaltan =
    faltan === 1 ? T.faltaUna : T.faltanVarias.replace('{n}', String(faltan));

  return (
    <section className="formulario-quiz" aria-labelledby="formulario-quiz-titulo">
      <header className="formulario-quiz__barra">
        <div>
          <h2 id="formulario-quiz-titulo" className="formulario-quiz__titulo">
            {quiz.titulo}
          </h2>
          <p className="formulario-quiz__progreso">
            {`${T.contestadas}: ${total - faltan} de ${total}`}
          </p>
        </div>

        <div className="formulario-quiz__reloj">
          <span className="formulario-quiz__reloj-etiqueta">{T.tiempoRestante}</span>
          <span
            role="timer"
            className={`formulario-quiz__tiempo${
              urgente ? ' formulario-quiz__tiempo--urgente' : ''
            }`}
          >
            {formatearTiempo(segundosRestantes ?? 0)}
          </span>
        </div>
      </header>

      {agotado && (
        <p className="formulario-quiz__mensaje" role="status">
          {T.tiempoAgotado}
        </p>
      )}

      <div className="formulario-quiz__preguntas">
        {preguntasOrdenadas.map((pregunta, indice) => (
          <fieldset
            key={pregunta.id_pregunta}
            className="formulario-quiz__pregunta"
            disabled={bloqueado}
          >
            <legend className="formulario-quiz__enunciado">
              {`${indice + 1}. ${pregunta.enunciado}`}
            </legend>

            <ul className="formulario-quiz__opciones">
              {opcionesDePregunta(pregunta).map((texto, posicion) => (
                <li key={`${pregunta.id_pregunta}-${LETRAS[posicion]}`}>
                  <label className="formulario-quiz__opcion">
                    <input
                      type="radio"
                      name={`pregunta-${pregunta.id_pregunta}`}
                      value={texto}
                      checked={respuestas[pregunta.id_pregunta] === texto}
                      onChange={() => elegir(pregunta.id_pregunta, texto)}
                    />
                    <span>
                      <span className="formulario-quiz__letra">{`${LETRAS[posicion]})`}</span>{' '}
                      {texto}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}
      </div>

      <Aviso tipo="error" mensaje={errorEnvio} />

      {confirmando && !agotado && (
        <div className="formulario-quiz__confirmacion" role="alert">
          <p className="formulario-quiz__confirmacion-texto">{textoFaltan}</p>
          <p className="formulario-quiz__confirmacion-ayuda">{T.avisoSinContestar}</p>
          <div className="formulario-quiz__confirmacion-acciones">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmando(false)}
            >
              {T.botonVolver}
            </button>
            <button type="button" className="btn btn-primary" onClick={enviar}>
              {T.botonEnviarIgual}
            </button>
          </div>
        </div>
      )}

      <div className="formulario-quiz__acciones">
        <button type="button" className="btn btn-primary" disabled={enviando} onClick={finalizar}>
          {enviando ? T.botonEnviando : T.botonFinalizar}
        </button>
      </div>
    </section>
  );
}