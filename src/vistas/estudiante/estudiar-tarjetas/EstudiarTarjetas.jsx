// vistas/estudiante/estudiar-tarjetas/EstudiarTarjetas.jsx
// HU-010: Estudiar con repetición espaciada (flashcards + SM-2)
//
// CA-4.1.1  Frente / dorso: la palabra en inglés; al girar se ven traducción, definición y ejemplo.
// CA-4.1.2  Valoración Repetir / Difícil / Buena / Fácil -> el back recalcula SM-2 y programa
//           el próximo repaso.
// CA-4.1.3  "Repetir" reintroduce la tarjeta al final del bloque; al terminar se muestra un
//           resumen de la sesión.
//
// Uso (por ejemplo desde PanelEstudiante.jsx):
//   <EstudiarTarjetas inscripcionId={inscripcionId} onSalir={volverAlPanel} />

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import './estudiar-tarjetas.css';
import { iniciarSesionRepaso, registrarValoracion } from '../../../cliente-api/estudioApi';
import {
  MENSAJE_SIN_INSCRIPCION,
  TEXTO_MODO,
  TITULO_POR_DEFECTO,
  VALORACIONES,
  VALORACIONES_UI,
} from './estudiarTarjetas.constants';
import { TarjetaFlashcard } from './TarjetaFlashcard';
import { BotonesValoracion } from './BotonesValoracion';

const servicioPorDefecto = { iniciarSesionRepaso, registrarValoracion };

const conteosIniciales = () =>
  Object.fromEntries(Object.values(VALORACIONES).map((valoracion) => [valoracion, 0]));

const estadoInicial = {
  fase: 'cargando', // cargando | error | vacio | estudiando | terminada
  error: null,
  total: 0,
  cola: [],
  completadas: 0,
  volteada: false, // cara visible
  vista: false, // la respuesta ya se vio al menos una vez (habilita la valoración)
  turno: 0, // cambia con cada valoración guardada; sirve para manejar el foco
  guardando: false,
  errorGuardado: null,
  mensaje: '',
  conteos: conteosIniciales(),
  repetidas: [],
  inicio: null,
  fin: null,
};

function reductor(estado, accion) {
  switch (accion.tipo) {
    case 'CARGA_INICIO':
      return { ...estadoInicial };

    case 'CARGA_OK': {
      if (accion.tarjetas.length === 0) return { ...estadoInicial, fase: 'vacio' };
      return {
        ...estadoInicial,
        fase: 'estudiando',
        total: accion.tarjetas.length,
        cola: accion.tarjetas,
        inicio: Date.now(),
      };
    }

    case 'CARGA_ERROR':
      return { ...estadoInicial, fase: 'error', error: accion.mensaje };

    case 'VOLTEAR':
      return { ...estado, volteada: !estado.volteada, vista: estado.vista || !estado.volteada };

    case 'GUARDADO_INICIO':
      return { ...estado, guardando: true, errorGuardado: null };

    case 'GUARDADO_ERROR':
      return { ...estado, guardando: false, errorGuardado: accion.mensaje };

    case 'GUARDADO_OK': {
      const [actual, ...resto] = estado.cola;
      const repetir = accion.valoracion === VALORACIONES.REPETIR;

      // CA-4.1.3: una tarjeta que se marca "Repetir" vuelve al final del bloque.
      const cola = repetir ? [...resto, actual] : resto;

      const siguiente = {
        ...estado,
        cola,
        guardando: false,
        errorGuardado: null,
        volteada: false,
        vista: false,
        turno: estado.turno + 1,
        mensaje: accion.mensaje,
        completadas: estado.completadas + (repetir ? 0 : 1),
        conteos: {
          ...estado.conteos,
          [accion.valoracion]: estado.conteos[accion.valoracion] + 1,
        },
        repetidas:
          repetir && !estado.repetidas.includes(actual.id_tarjeta)
            ? [...estado.repetidas, actual.id_tarjeta]
            : estado.repetidas,
      };

      return cola.length === 0 ? { ...siguiente, fase: 'terminada', fin: Date.now() } : siguiente;
    }

    default:
      return estado;
  }
}

function pluralizar(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`;
}

function formatearDuracion(ms) {
  const segundos = Math.max(0, Math.round(ms / 1000));
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return minutos > 0 ? `${minutos} min ${resto} s` : `${resto} s`;
}

function construirMensaje(valoracion, progreso) {
  if (valoracion === VALORACIONES.REPETIR) {
    return 'Guardado. Esta tarjeta volverá al final de la sesión.';
  }
  const dias = Number(progreso?.intervalo_dias);
  return Number.isFinite(dias) && dias > 0
    ? `Guardado. Próximo repaso en ${pluralizar(dias, 'día', 'días')}.`
    : 'Guardado.';
}

const IconoVolver = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

/**
 * @param {Object}   props
 * @param {number}   props.inscripcionId  Inscripción activa del estudiante (la exige el back).
 * @param {Object}   [props.mazosPorId]   { [mazo_id]: { nombre, semana } } para el encabezado.
 * @param {Function} [props.onSalir]      Si se pasa, se muestra la flecha y "Volver a los mazos".
 * @param {Object}   [props.servicio]     Reemplazo de la API (útil para pruebas).
 */
export function EstudiarTarjetas({
  inscripcionId,
  mazosPorId,
  onSalir,
  servicio = servicioPorDefecto,
}) {
  const [estado, dispatch] = useReducer(reductor, estadoInicial);
  const [recarga, setRecarga] = useState(0);

  const botonGiroRef = useRef(null);

  const actual = estado.cola[0];

  // ---------- Carga de la sesión ----------
  useEffect(() => {
    if (!inscripcionId) {
      dispatch({ tipo: 'CARGA_ERROR', mensaje: MENSAJE_SIN_INSCRIPCION });
      return undefined;
    }

    let cancelado = false;
    dispatch({ tipo: 'CARGA_INICIO' });

    servicio
      .iniciarSesionRepaso(inscripcionId)
      .then((datos) => {
        if (!cancelado) dispatch({ tipo: 'CARGA_OK', tarjetas: datos?.tarjetas ?? [] });
      })
      .catch((error) => {
        if (!cancelado) dispatch({ tipo: 'CARGA_ERROR', mensaje: error.message });
      });

    return () => {
      cancelado = true;
    };
  }, [servicio, inscripcionId, recarga]);

  const voltear = useCallback(() => dispatch({ tipo: 'VOLTEAR' }), []);

  // ---------- Valoración (CA-4.1.2) ----------
  const valorar = useCallback(
    async (valoracion) => {
      if (!actual || estado.guardando || !estado.vista) return;

      dispatch({ tipo: 'GUARDADO_INICIO' });
      try {
        const progreso = await servicio.registrarValoracion(
          inscripcionId,
          actual.id_tarjeta,
          valoracion
        );
        dispatch({
          tipo: 'GUARDADO_OK',
          valoracion,
          mensaje: construirMensaje(valoracion, progreso),
        });
      } catch (error) {
        dispatch({ tipo: 'GUARDADO_ERROR', mensaje: error.message });
      }
    },
    [actual, estado.guardando, estado.vista, servicio, inscripcionId]
  );

  // ---------- Atajos de teclado: Espacio/Enter gira, 1-4 valoran ----------
  useEffect(() => {
    if (estado.fase !== 'estudiando') return undefined;

    const alPulsar = (evento) => {
      if (evento.metaKey || evento.ctrlKey || evento.altKey) return;
      const objetivo = evento.target instanceof Element ? evento.target : null;

      if (evento.key === ' ' || evento.key === 'Enter') {
        // Si el foco está en un botón, enlace o campo, el navegador ya maneja la tecla.
        if (objetivo?.closest('button, a, input, textarea, select')) return;
        evento.preventDefault();
        voltear();
        return;
      }

      const valoracion = VALORACIONES_UI.find((item) => item.tecla === evento.key);
      if (valoracion && estado.vista && !estado.guardando) {
        evento.preventDefault();
        valorar(valoracion.valor);
      }
    };

    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [estado.fase, estado.vista, estado.guardando, voltear, valorar]);

  // Tras valorar, el foco vuelve al botón de giro para poder seguir solo con teclado.
  // No se enfoca en la carga inicial para no mostrar un aro de foco sin que el usuario lo pida.
  useEffect(() => {
    if (estado.fase === 'estudiando' && estado.turno > 0) {
      botonGiroRef.current?.focus({ preventScroll: true });
    }
  }, [estado.fase, estado.turno]);

  const recargar = () => setRecarga((n) => n + 1);

  const botonSalir = onSalir && (
    <button type="button" className="estudiar-boton" onClick={onSalir}>
      Volver a los mazos
    </button>
  );

  // ---------- Estados sin tarjeta ----------

  if (estado.fase === 'cargando') {
    return (
      <section className="estudiar estudiar--centrado" aria-busy="true">
        <p className="estudiar-texto" role="status">
          Preparando tus tarjetas…
        </p>
      </section>
    );
  }

  if (estado.fase === 'error') {
    return (
      <section className="estudiar estudiar--centrado">
        <h2 className="estudiar-titulo">No pudimos cargar tu repaso</h2>
        <p className="estudiar-texto" role="alert">
          {estado.error}
        </p>
        <div className="estudiar-acciones">
          <button
            type="button"
            className="estudiar-boton estudiar-boton--primario"
            onClick={recargar}
          >
            Reintentar
          </button>
          {botonSalir}
        </div>
      </section>
    );
  }

  if (estado.fase === 'vacio') {
    return (
      <section className="estudiar estudiar--centrado">
        <h2 className="estudiar-titulo">No tienes tarjetas para repasar ahora</h2>
        <p className="estudiar-texto">
          Aparecerán aquí cuando venza el próximo repaso de alguna palabra o cuando la docente
          apruebe palabras nuevas en los mazos abiertos.
        </p>
        <div className="estudiar-acciones">
          <button
            type="button"
            className="estudiar-boton estudiar-boton--primario"
            onClick={recargar}
          >
            Volver a cargar
          </button>
          {botonSalir}
        </div>
      </section>
    );
  }

  // ---------- Resumen final (CA-4.1.3) ----------

  if (estado.fase === 'terminada') {
    const totalValoraciones = Object.values(estado.conteos).reduce((suma, n) => suma + n, 0);

    return (
      <section
        className="estudiar estudiar--centrado"
        aria-labelledby="estudiar-resumen-titulo"
      >
        <h2 className="estudiar-titulo" id="estudiar-resumen-titulo">
          Sesión completada
        </h2>
        <p className="estudiar-texto">
          Repasaste {pluralizar(estado.total, 'tarjeta', 'tarjetas')} en{' '}
          {formatearDuracion(estado.fin - estado.inicio)}.
        </p>

        <div className="estudiar-distribucion" aria-hidden="true">
          {VALORACIONES_UI.map(({ id, valor }) =>
            estado.conteos[valor] > 0 ? (
              <span
                key={id}
                className={`estudiar-distribucion__tramo estudiar-color--${id}`}
                style={{ flexGrow: estado.conteos[valor] }}
              />
            ) : null
          )}
        </div>

        <ul
          className="estudiar-resumen"
          aria-label={`${totalValoraciones} valoraciones registradas`}
        >
          {VALORACIONES_UI.map(({ id, valor, etiqueta }) => (
            <li key={id}>
              <span className={`estudiar-muestra estudiar-color--${id}`} aria-hidden="true" />
              <span className="estudiar-resumen__etiqueta">{etiqueta}</span>
              <strong>{estado.conteos[valor]}</strong>
            </li>
          ))}
        </ul>

        <div className="estudiar-acciones">
          <button
            type="button"
            className="estudiar-boton estudiar-boton--primario"
            onClick={recargar}
          >
            Buscar más tarjetas
          </button>
          {botonSalir}
        </div>
      </section>
    );
  }

  // ---------- Sesión de estudio (CA-4.1.1 y CA-4.1.2) ----------

  const posicion = Math.min(estado.completadas + 1, estado.total);
  const porcentaje = Math.round((posicion / estado.total) * 100);
  const mazo = mazosPorId?.[actual.mazo_id];
  const etiquetas = Array.isArray(actual.etiquetas) ? actual.etiquetas : [];
  const repetida = estado.repetidas.includes(actual.id_tarjeta);

  return (
    <section className="estudiar" aria-label="Modo estudio">
      <header className="estudiar-encabezado">
        <div className="estudiar-encabezado__izq">
          {onSalir && (
            <button
              type="button"
              className="estudiar-volver"
              aria-label="Volver a los mazos"
              onClick={onSalir}
            >
              <IconoVolver />
            </button>
          )}
          <div>
            <p className="estudiar-meta">
              {mazo?.semana && (
                <span className="estudiar-chip estudiar-chip--semana">Semana {mazo.semana}</span>
              )}
              <span>{TEXTO_MODO}</span>
            </p>
            <h2 className="estudiar-titulo">{mazo?.nombre ?? TITULO_POR_DEFECTO}</h2>
          </div>
        </div>

        <div className="estudiar-progreso">
          <p className="estudiar-progreso__etiqueta">Progreso de la sesión</p>
          <div className="estudiar-progreso__fila">
            <p className="estudiar-progreso__valor">
              Tarjeta {posicion} de {estado.total}
            </p>
            <div
              className="estudiar-progreso__pista"
              role="progressbar"
              aria-label="Progreso de la sesión"
              aria-valuemin={0}
              aria-valuemax={estado.total}
              aria-valuenow={posicion}
            >
              <div className="estudiar-progreso__relleno" style={{ width: `${porcentaje}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="estudiar-escenario">
        <div className="estudiar-fila">
          <p className="estudiar-termino">
            <span>
              Término {posicion}/{estado.total}
            </span>
            {actual.categoria_gramatical && (
              <span className="estudiar-chip estudiar-chip--categoria">
                {actual.categoria_gramatical}
              </span>
            )}
          </p>

          {etiquetas.length > 0 && (
            <ul className="estudiar-etiquetas" aria-label="Etiquetas de contexto">
              {etiquetas.map((etiqueta) => (
                <li key={etiqueta} className="estudiar-chip estudiar-chip--etiqueta">
                  {etiqueta}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* key: cada tarjeta nueva se monta ya de frente, sin animar el giro de vuelta */}
        <TarjetaFlashcard
          key={actual.id_tarjeta}
          tarjeta={actual}
          volteada={estado.volteada}
          repetida={repetida}
          atajos={VALORACIONES_UI}
          onVoltear={voltear}
          botonGiroRef={botonGiroRef}
        />

        <BotonesValoracion
          habilitado={estado.vista}
          guardando={estado.guardando}
          onValorar={valorar}
        />

        <p className="estudiar-estado" role="status">
          {estado.mensaje}
        </p>

        {estado.errorGuardado && (
          <p className="estudiar-error" role="alert">
            No se pudo guardar tu valoración: {estado.errorGuardado} Elige una opción para
            intentarlo de nuevo.
          </p>
        )}
      </div>
    </section>
  );
}
