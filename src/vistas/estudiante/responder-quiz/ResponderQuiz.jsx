/**
 * @file ResponderQuiz.jsx
 * @brief HU-3.2: pantalla del estudiante para responder un quiz y recibir su nota.
 * Une la portada, el formulario y el resultado, y es el único que habla con el backend.
 * Contrato: CONTRATO_FRONTEND_HU-3.2.md (backend). Ruta: /estudiante/quices/:idQuiz.
 *
 * Flujo:
 *   1. Si hay un resultado guardado en el navegador, se muestra directo (CA-3.2.3).
 *   2. Si hay un borrador de un intento en curso y el quiz sigue abierto, se retoma.
 *   3. Si no, portada -> "Iniciar" -> formulario -> resultado.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  enviarRespuestasQuiz,
  obtenerPreguntasQuiz,
  obtenerQuiz,
} from '../../../cliente-api/quizzesApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { useAuth } from '../../../contexto/useAuth';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';
import { FormularioQuiz } from './FormularioQuiz';
import { PortadaQuiz } from './PortadaQuiz';
import { ResultadoQuiz } from './ResultadoQuiz';
import {
  ESTADO,
  TEXTOS_CLAVES,
  TEXTOS_CONTENEDOR_CLAVES as C,
} from './responderQuiz.constants';
import {
  borrarBorrador,
  guardarBorrador,
  guardarResultado,
  leerBorrador,
  leerResultado,
} from './responderQuiz.storage';
import './responder-quiz.css';

/** @brief API real que usa la pantalla si no se le pasa otro servicio. */
const servicioPorDefecto = { obtenerQuiz, obtenerPreguntasQuiz, enviarRespuestasQuiz };

/** @brief Pantallas por las que pasa el flujo del quiz. */
const FASE = {
  CARGANDO: 'cargando',
  ERROR: 'error',
  PORTADA: 'portada',
  FORMULARIO: 'formulario',
  RESULTADO: 'resultado',
};

/**
 * @brief Descriptor de error: { mensaje } si lo trae el backend (se muestra tal cual; puede estar
 * en español, pendiente de revisar) o { clave } para el texto propio (se traduce al mostrarlo).
 * @param {Error} error - Error lanzado por la API.
 * @return {{mensaje?: string, clave?: string}}
 */
const descriptorDeError = (error) =>
  error?.message ? { mensaje: error.message } : { clave: C.errorGenerico };

/**
 * @brief Pantalla /estudiante/quices/:idQuiz: portada, formulario y resultado del quiz.
 * @param {Object} [props]
 * @param {Object} [props.servicio] Reemplazo de la API (útil para pruebas).
 * @return {JSX.Element}
 */
export function ResponderQuiz({ servicio = servicioPorDefecto }) {
  const { t } = useTranslation();
  const { idQuiz } = useParams();
  const navigate = useNavigate();
  const { estudianteId, logout } = useAuth();

  // El título de la página lo pinta el layout (barra superior).
  useEncabezadoPagina(t(TEXTOS_CLAVES.tituloPagina), t(TEXTOS_CLAVES.descripcionPagina));

  const [fase, setFase] = useState(FASE.CARGANDO);
  const [errorCarga, setErrorCarga] = useState(null);
  const [recarga, setRecarga] = useState(0);

  const [quiz, setQuiz] = useState(null);
  const [preguntas, setPreguntas] = useState(null);
  const [intento, setIntento] = useState(null); // { fechaInicio, respuestasIniciales }
  const [resumen, setResumen] = useState(null); // { resultado, respuestas, yaEnviado }

  const [iniciando, setIniciando] = useState(false);
  const [errorInicio, setErrorInicio] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);

  // Evita un segundo envío mientras el primero sigue en curso (botón + autoenvío).
  const envioEnCursoRef = useRef(false);

  /**
   * @brief Texto a mostrar de un descriptor de error.
   * @param {{mensaje?: string, clave?: string}|null} descriptor
   * @return {string|null}
   */
  const textoError = (descriptor) =>
    descriptor ? (descriptor.clave ? t(descriptor.clave) : descriptor.mensaje) : null;

  // ---------- Carga inicial ----------
  useEffect(() => {
    let cancelado = false;
    const guardado = leerResultado(idQuiz, estudianteId);

    servicio
      .obtenerQuiz(idQuiz)
      .catch((error) => {
        // Con un resultado guardado se puede mostrar aunque falle la consulta del quiz.
        if (guardado) return null;
        throw error;
      })
      .then(async (datosQuiz) => {
        if (cancelado) return;
        setQuiz(datosQuiz);

        // CA-3.2.3: el quiz ya se envió desde este navegador.
        if (guardado) {
          setResumen({
            resultado: guardado.resultado,
            respuestas: guardado.respuestas,
            yaEnviado: true,
          });
          setPreguntas(guardado.preguntas);
          setFase(FASE.RESULTADO);
          return;
        }

        // Intento en curso (por ejemplo, tras recargar la página): se retoma.
        const borrador = leerBorrador(idQuiz);
        if (borrador && datosQuiz.estado_efectivo === ESTADO.ABIERTO) {
          const datos = await servicio.obtenerPreguntasQuiz(idQuiz);
          if (cancelado) return;
          setPreguntas(datos.preguntas);
          setIntento({
            fechaInicio: borrador.fechaInicio,
            respuestasIniciales: borrador.respuestas,
          });
          setFase(FASE.FORMULARIO);
          return;
        }

        setFase(FASE.PORTADA);
      })
      .catch((error) => {
        if (cancelado) return;
        setErrorCarga(descriptorDeError(error));
        setFase(FASE.ERROR);
      });

    return () => {
      cancelado = true;
    };
  }, [servicio, idQuiz, estudianteId, recarga]);

  /** @brief Vuelve a cargar el quiz después de un error. */
  function recargar() {
    setErrorCarga(null);
    setFase(FASE.CARGANDO);
    setRecarga((n) => n + 1);
  }

  // ---------- "Iniciar": pide las preguntas y arranca el reloj ----------
  /** @brief Pide las preguntas, guarda la hora de inicio y muestra el formulario. */
  async function iniciar() {
    if (iniciando) return;
    setIniciando(true);
    setErrorInicio(null);

    try {
      const datos = await servicio.obtenerPreguntasQuiz(idQuiz);
      const fechaInicio = new Date().toISOString();
      guardarBorrador(idQuiz, { fechaInicio, respuestas: {} });

      setPreguntas(datos.preguntas);
      setIntento({ fechaInicio, respuestasIniciales: {} });
      setFase(FASE.FORMULARIO);
    } catch (error) {
      setErrorInicio(descriptorDeError(error));
      if (error?.status === 401) logout();
    } finally {
      setIniciando(false);
    }
  }

  // ---------- Envío (manual o automático al agotarse el tiempo) ----------
  /**
   * @brief Envía las respuestas (evitando envíos dobles), guarda el resultado y lo muestra.
   * @param {Object} payload - Cuerpo del POST /quizzes/:id/submit.
   */
  async function enviar(payload) {
    if (envioEnCursoRef.current) return;
    envioEnCursoRef.current = true;
    setEnviando(true);
    setErrorEnvio(null);

    try {
      // Tanto el 201 como el 409 devuelven { resultado, respuestas, yaEnviado }.
      const datos = await servicio.enviarRespuestasQuiz(idQuiz, payload);

      guardarResultado(idQuiz, estudianteId, {
        resultado: datos.resultado,
        respuestas: datos.respuestas,
        preguntas,
      });
      borrarBorrador(idQuiz);

      setResumen(datos);
      setFase(FASE.RESULTADO);
    } catch (error) {
      setErrorEnvio(descriptorDeError(error));
      if (error?.status === 401) logout();
    } finally {
      envioEnCursoRef.current = false;
      setEnviando(false);
    }
  }

  // ---------- Pantallas ----------
  if (fase === FASE.CARGANDO) {
    return (
      <section className="responder-quiz__estado" aria-busy="true">
        <p role="status">{t(C.cargando)}</p>
      </section>
    );
  }

  if (fase === FASE.ERROR) {
    return (
      <section className="responder-quiz__estado">
        <Aviso tipo="error" mensaje={textoError(errorCarga)} />
        <button type="button" className="btn btn-primary" onClick={recargar}>
          {t(C.reintentar)}
        </button>
      </section>
    );
  }

  if (fase === FASE.PORTADA) {
    return (
      <div className="responder-quiz__columna">
        <Aviso tipo="error" mensaje={textoError(errorInicio)} />
        <PortadaQuiz quiz={quiz} onIniciar={iniciar} />
      </div>
    );
  }

  if (fase === FASE.FORMULARIO) {
    return (
      <FormularioQuiz
        quiz={quiz}
        preguntas={preguntas}
        fechaInicio={intento.fechaInicio}
        respuestasIniciales={intento.respuestasIniciales}
        onEnviar={enviar}
        enviando={enviando}
        errorEnvio={textoError(errorEnvio)}
      />
    );
  }

  return (
    <ResultadoQuiz
      resultado={resumen.resultado}
      respuestas={resumen.respuestas}
      preguntas={preguntas}
      titulo={quiz?.titulo}
      yaEnviado={resumen.yaEnviado}
      onVolver={() => navigate('/estudiante')}
    />
  );
}