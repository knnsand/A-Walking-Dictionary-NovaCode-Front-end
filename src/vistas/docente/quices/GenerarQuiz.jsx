import { useEffect, useState } from 'react';
import { listarCursos } from '../../../cliente-api/cursosApi';
import { listarMazos } from '../../../cliente-api/mazosApi';
import { generarQuiz } from '../../../cliente-api/quizzesApi';
import { exportarQuizPdf } from '../../../cliente-api/exportacionesApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { BotonExportarPdf } from '../../../componentes/comunes/BotonExportarPdf';
import { useAuth } from '../../../contexto/useAuth';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';
import { TEXTOS, TITULO_MAX } from './generarQuiz.constants';
import { validarFormularioQuiz } from './generarQuiz.validation';
import { construirPayloadQuiz } from './generarQuiz.payload';
import { VistaPreviaQuiz } from './VistaPreviaQuiz';
import { ListaQuicesGenerados } from './ListaQuicesGenerados';
import './generar-quiz.css';

const FORM_INICIAL = {
  titulo: '',
  fecha_apertura: '',
  fecha_cierre: '',
  tiempo_limite_min: '',
  cantidad_preguntas: '',
};

// Mensajes exactos que devuelve el backend en rutas protegidas
// (docs/CONTRATO_AUTENTICACION_FRONTEND.md, sección 4).
const ES_SESION_INVALIDA = (msg) =>
  /token de autenticación no proporcionado|token inválido o expirado/i.test(msg ?? '');
const ES_SIN_PERMISO = (msg) => /no tiene permisos para acceder a este recurso/i.test(msg ?? '');

// Si cambia alguno de estos campos, el error de "ventana corta" (que se muestra
// en el cierre) puede dejar de aplicar.
const CAMPOS_QUE_AFECTAN_EL_CIERRE = ['fecha_apertura', 'tiempo_limite_min'];

function etiquetaMazo(mazo) {
  return `Semana ${mazo.semana} · ${mazo.nombre_lectura}`;
}

function ErrorCampo({ mensaje }) {
  if (!mensaje) return null;
  return (
    <p className="generar-quiz__error" role="alert">
      {mensaje}
    </p>
  );
}

/**
 * Pantalla docente de HU-3.1: configurar y generar un quiz acumulativo.
 * Contrato: docs/contrato-quiz.md y docs/CONTRATO_FRONTEND_HU-3.1.md (backend).
 */
export function GenerarQuiz() {
  const { logout } = useAuth();
  // El título de la página lo pinta el layout (barra superior).
  useEncabezadoPagina(TEXTOS.titulo, TEXTOS.descripcion);

  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState('');
  const [cargandoCursos, setCargandoCursos] = useState(true);
  const [errorCursos, setErrorCursos] = useState(null);

  const [mazos, setMazos] = useState([]);
  const [mazosSeleccionados, setMazosSeleccionados] = useState([]);
  const [cargandoMazos, setCargandoMazos] = useState(true);
  const [errorMazos, setErrorMazos] = useState(null);

  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    let cancelado = false;

    listarCursos()
      .then((datos) => {
        if (!cancelado) setCursos(Array.isArray(datos) ? datos : []);
      })
      .catch(() => {
        if (!cancelado) setErrorCursos(TEXTOS.errorCursos);
      })
      .finally(() => {
        if (!cancelado) setCargandoCursos(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // GET /decks devuelve los mazos de todos los cursos; se filtran abajo por curso_id.
  useEffect(() => {
    let cancelado = false;

    listarMazos()
      .then((datos) => {
        if (!cancelado) setMazos(Array.isArray(datos) ? datos : []);
      })
      .catch(() => {
        if (!cancelado) setErrorMazos(TEXTOS.errorMazos);
      })
      .finally(() => {
        if (!cancelado) setCargandoMazos(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const mazosDelCurso = mazos
    .filter((m) => String(m.curso_id) === String(cursoId))
    .sort((a, b) => Number(a.semana) - Number(b.semana) || a.id_mazo - b.id_mazo);

  // Quita del estado de errores los campos indicados, para que el aviso
  // desaparezca en cuanto la docente corrige ese campo.
  function limpiarErrores(...claves) {
    setErrores((anteriores) => {
      if (!claves.some((clave) => clave in anteriores)) return anteriores;
      const copia = { ...anteriores };
      claves.forEach((clave) => delete copia[clave]);
      return copia;
    });
  }

  function cambiarCurso(nuevoCursoId) {
    setCursoId(nuevoCursoId);
    // Los mazos elegidos pertenecen al curso anterior: se descartan.
    setMazosSeleccionados([]);
    limpiarErrores('curso', 'mazos');
  }

  function alternarMazo(idMazo) {
    setMazosSeleccionados((actuales) =>
      actuales.includes(idMazo)
        ? actuales.filter((id) => id !== idMazo)
        : [...actuales, idMazo]
    );
    limpiarErrores('mazos');
  }

  function handleChange(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
    limpiarErrores(name, ...(CAMPOS_QUE_AFECTAN_EL_CIERRE.includes(name) ? ['fecha_cierre'] : []));
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    if (enviando) return;

    setErrorEnvio(null);
    setResultado(null);

    const erroresForm = validarFormularioQuiz({ cursoId, mazosSeleccionados, form });
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) return;

    setEnviando(true);
    try {
      const respuesta = await generarQuiz(
        construirPayloadQuiz({ cursoId, mazosSeleccionados, form })
      );
      setResultado(respuesta);
      setForm(FORM_INICIAL);
      setMazosSeleccionados([]);
    } catch (error) {
      const mensaje = error?.message ?? '';
      if (ES_SESION_INVALIDA(mensaje)) {
        setErrorEnvio(TEXTOS.sesionVencida);
        logout();
      } else if (ES_SIN_PERMISO(mensaje)) {
        setErrorEnvio(TEXTOS.sinPermiso);
      } else {
        setErrorEnvio(mensaje || TEXTOS.errorGenerico);
      }
    } finally {
      setEnviando(false);
    }
  }

    const totalPreguntas = resultado?.preguntas.length ?? 0;
  const mensajeExito = resultado
    ? `${TEXTOS.exitoTitulo}: «${resultado.quiz.titulo}» con ${totalPreguntas} ${
        totalPreguntas === 1 ? 'pregunta' : 'preguntas'
      }. Estado: ${
        TEXTOS.estadoEfectivo[resultado.quiz.estado_efectivo] ?? resultado.quiz.estado_efectivo
      }.`
    : null;

  return (
    <section className="generar-quiz">
      <form className="generar-quiz__form" noValidate onSubmit={handleSubmit}>
        <Aviso tipo="error" mensaje={errorCursos} />

        <div className="form-group">
          <label className="form-label form-label--obligatorio" htmlFor="curso_id">
            {TEXTOS.etiquetaCurso}
          </label>
          <select
            id="curso_id"
            className="form-select"
            value={cursoId}
            onChange={(e) => cambiarCurso(e.target.value)}
            disabled={cargandoCursos}
          >
            <option value="">
              {cargandoCursos ? TEXTOS.cargandoCursos : TEXTOS.placeholderCurso}
            </option>
            {cursos.map((curso) => (
              <option key={curso.id_curso} value={curso.id_curso}>
                {curso.nombre}
              </option>
            ))}
          </select>
          <ErrorCampo mensaje={errores.curso} />
        </div>

        {cursoId && (
          <div className="form-group">
            <span className="form-label form-label--obligatorio">
              {TEXTOS.etiquetaMazos}
            </span>
            <small>{TEXTOS.ayudaMazos}</small>

            <Aviso tipo="error" mensaje={errorMazos} />

            {cargandoMazos && <p>{TEXTOS.cargandoMazos}</p>}

            {!cargandoMazos && !errorMazos && mazosDelCurso.length === 0 && (
              <p className="empty-state">{TEXTOS.sinMazosCurso}</p>
            )}

            {mazosDelCurso.length > 0 && (
              <ul className="generar-quiz__mazos">
                {mazosDelCurso.map((mazo) => (
                  <li key={mazo.id_mazo}>
                    <label>
                      <input
                        type="checkbox"
                        checked={mazosSeleccionados.includes(mazo.id_mazo)}
                        onChange={() => alternarMazo(mazo.id_mazo)}
                      />{' '}
                      {etiquetaMazo(mazo)}
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <ErrorCampo mensaje={errores.mazos} />
          </div>
        )}

        <div className="form-group">
          <label className="form-label form-label--obligatorio" htmlFor="titulo">
            {TEXTOS.etiquetaTitulo}
          </label>
          <input
            id="titulo"
            className="form-input"
            type="text"
            name="titulo"
            maxLength={TITULO_MAX}
            placeholder={TEXTOS.placeholderTitulo}
            value={form.titulo}
            onChange={handleChange}
          />
          <ErrorCampo mensaje={errores.titulo} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label form-label--obligatorio" htmlFor="fecha_apertura">
              {TEXTOS.etiquetaApertura}
            </label>
            <input
              id="fecha_apertura"
              className="form-input"
              type="datetime-local"
              name="fecha_apertura"
              value={form.fecha_apertura}
              onChange={handleChange}
            />
            <ErrorCampo mensaje={errores.fecha_apertura} />
          </div>
          <div className="form-group">
            <label className="form-label form-label--obligatorio" htmlFor="fecha_cierre">
              {TEXTOS.etiquetaCierre}
            </label>
            <input
              id="fecha_cierre"
              className="form-input"
              type="datetime-local"
              name="fecha_cierre"
              value={form.fecha_cierre}
              onChange={handleChange}
            />
            <ErrorCampo mensaje={errores.fecha_cierre} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label form-label--obligatorio" htmlFor="tiempo_limite_min">
              {TEXTOS.etiquetaTiempo}
            </label>
            <input
              id="tiempo_limite_min"
              className="form-input"
              type="number"
              min="1"
              step="1"
              name="tiempo_limite_min"
              value={form.tiempo_limite_min}
              onChange={handleChange}
            />
            <ErrorCampo mensaje={errores.tiempo_limite_min} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cantidad_preguntas">
              {TEXTOS.etiquetaCantidad}
            </label>
            <input
              id="cantidad_preguntas"
              className="form-input"
              type="number"
              min="1"
              step="1"
              name="cantidad_preguntas"
              value={form.cantidad_preguntas}
              onChange={handleChange}
            />
            <small>{TEXTOS.ayudaCantidad}</small>
            <ErrorCampo mensaje={errores.cantidad_preguntas} />
          </div>
        </div>

        <Aviso tipo="error" mensaje={errorEnvio} />
        <Aviso tipo="exito" mensaje={mensajeExito} />

        <div className="generar-quiz__acciones">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? TEXTOS.botonGenerando : TEXTOS.botonGenerar}
          </button>
        </div>
      </form>

      {resultado && (
        <>
          {/* HU-3.3 (CA-3.3.2): exportar de inmediato el quiz recién generado. */}
          <div className="generar-quiz__exportar">
            <BotonExportarPdf
              onExportar={() => exportarQuizPdf(resultado.quiz.id_quiz)}
              etiqueta={TEXTOS.botonExportarQuiz}
              ariaLabel={`${TEXTOS.botonExportarQuiz} del quiz ${resultado.quiz.titulo}`}
            />
          </div>

          <VistaPreviaQuiz preguntas={resultado.preguntas} />
        </>
      )}

      {/* HU-3.3 (CA-3.3.2): quices ya generados; se recarga al generar uno nuevo. */}
      <ListaQuicesGenerados refrescarTrigger={resultado?.quiz.id_quiz} />
    </section>
  );
}