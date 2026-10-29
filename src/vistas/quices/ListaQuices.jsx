/**
 * @file ListaQuices.jsx
 * @brief HU-009: lista de quices compartida por docente y estudiante (mismo patrón que
 * MazosEstudio: una sola vista y las acciones de cada tarjeta dependen del rol).
 *
 * Dónde se usa:
 *   - docente:    dentro de GenerarQuiz (/docente/quices), justo debajo del formulario, con
 *                 la prop `embebida` (no pisa el encabezado de la pantalla). Cada tarjeta
 *                 trae su botón de exportar la versión impresa (HU-3.3, CA-3.3.2).
 *   - estudiante: pantalla propia /estudiante/quices. Cada tarjeta enlaza a
 *                 /estudiante/quices/:idQuiz (ResponderQuiz, HU-3.2).
 *
 * Siempre se usa `estado_efectivo`, nunca `estado`.
 *
 * Datos: GET /quizzes (listarQuices): todos los quices, de todos los cursos y sin orden
 * garantizado. Cuando exista GET /quizzes/mine (docs/contrato-quiz-estudiante.md, 2.1), el
 * estudiante recibirá otro `servicio` y `quiz.resultado` traerá la nota de los ya enviados.
 *
 * PENDIENTE al fusionar HU-3.2 (esta rama aún no la trae): además de `quiz.resultado`, marcar
 * como respondido con leerResultado(idQuiz, estudianteId) de responderQuiz.storage.js, que
 * requiere useAuth().estudianteId.
 *
 * Aspecto: reutiliza la librería visual global de las tarjetas de Revisión de Palabras
 * (.tarjeta-pendiente dentro de .mazo-pila, .badge, .btn); solo la cuadrícula y el color por
 * estado viven en lista-quices.css.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { exportarQuizPdf } from '../../cliente-api/exportacionesApi';
import { listarQuices } from '../../cliente-api/quizzesApi';
import { Aviso } from '../../componentes/comunes/Aviso';
import { BotonExportarPdf } from '../../componentes/comunes/BotonExportarPdf';
import { useEncabezadoPagina } from '../../contexto/useEncabezadoPagina';
import {
  CLASE_BADGE_ESTADO,
  ESTADO,
  ETIQUETA_ESTADO,
  TEXTOS_CLAVES,
  TEXTOS_POR_ROL,
} from './listaQuices.constants';
import { formatearFecha, textoNota } from './listaQuices.format';
import './lista-quices.css';

/** @brief API real que usa la lista si no se le pasa otro servicio. */
const servicioPorDefecto = { listarQuices };

/**
 * @brief Pinta el título de la pantalla en el layout (recibe los textos ya traducidos). Va en su propio componente para poder
 * omitirlo cuando la lista está dentro de otra pantalla (que ya tiene su encabezado).
 * @param {Object} props
 * @param {string} props.titulo - Título de la pantalla.
 * @param {string} props.descripcion - Subtítulo de la pantalla.
 * @return {null}
 */
function EncabezadoLista({ titulo, descripcion }) {
  useEncabezadoPagina(titulo, descripcion);
  return null;
}

/**
 * @brief Lista de quices en tarjetas, con acciones según el rol.
 * @param {Object} props
 * @param {'docente'|'estudiante'} props.rol
 * @param {boolean} [props.embebida] true cuando va dentro de otra pantalla: no toca el
 *   encabezado del layout y muestra su propio subtítulo de sección.
 * @param {number|string} [props.refrescarTrigger] Cuando cambia, se vuelve a cargar la lista
 *   (la docente lo usa al generar un quiz nuevo).
 * @param {Object} [props.servicio] Reemplazo de la API (útil para pruebas).
 * @return {JSX.Element}
 */
export function ListaQuices({
  rol,
  embebida = false,
  refrescarTrigger,
  servicio = servicioPorDefecto,
}) {
  const { t } = useTranslation();
  const esDocente = rol === 'docente';
  const textos = TEXTOS_POR_ROL[rol] ?? TEXTOS_POR_ROL.estudiante;

  const [quices, setQuices] = useState([]);
  const [cargando, setCargando] = useState(true);
  // Clave de traducción del error (se traduce al mostrarlo).
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    servicio
      .listarQuices()
      .then((datos) => {
        if (cancelado) return;
        setQuices(Array.isArray(datos) ? datos : []);
        setError(null);
      })
      .catch(() => {
        if (!cancelado) setError(TEXTOS_CLAVES.errorGenerico);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [servicio, refrescarTrigger]);

  // Los más recientes primero (el backend no garantiza el orden).
  const ordenados = useMemo(() => [...quices].sort((a, b) => b.id_quiz - a.id_quiz), [quices]);

  return (
    <section className={`lista-quices-vista${embebida ? ' lista-quices-vista--embebida' : ''}`}>
      {embebida ? (
        <div className="lista-quices-vista__encabezado">
          <h2 className="lista-quices-vista__titulo">{t(textos.titulo)}</h2>
          <p className="lista-quices-vista__descripcion">{t(textos.descripcion)}</p>
        </div>
      ) : (
        <EncabezadoLista titulo={t(textos.titulo)} descripcion={t(textos.descripcion)} />
      )}

      <Aviso tipo="error" mensaje={error ? t(error) : null} />

      {cargando && <p role="status">{t(TEXTOS_CLAVES.cargando)}</p>}

      {!cargando && !error && ordenados.length === 0 && (
        <p className="empty-state">{t(esDocente ? TEXTOS_CLAVES.vacioDocente : TEXTOS_CLAVES.vacio)}</p>
      )}

      {ordenados.length > 0 && (
        <ul className="quices-grid">
          {ordenados.map((quiz) => {
            const estado = quiz.estado_efectivo;
            // Solo el estudiante tiene resultado propio.
            const resultado = esDocente ? null : quiz.resultado ?? null;

            let accion = TEXTOS_CLAVES.accionDetalle;
            if (resultado) accion = TEXTOS_CLAVES.accionResultado;
            else if (estado === ESTADO.ABIERTO) accion = TEXTOS_CLAVES.accionResponder;

            return (
              <li key={quiz.id_quiz} className={`mazo-pila mazo-pila--sola quiz-pila--${estado}`}>
                <div className="tarjeta-pendiente mazo-pila__cara">
                  <div className="tarjeta-pendiente__encabezado">
                    <span className={`badge ${CLASE_BADGE_ESTADO[estado] ?? 'badge-cerrado'}`}>
                      {ETIQUETA_ESTADO[estado] ? t(ETIQUETA_ESTADO[estado]) : estado}
                    </span>
                    <h3 className="tarjeta-pendiente__palabra">{quiz.titulo}</h3>
                  </div>

                  {quiz.semana_corte != null && (
                    <div className="tarjeta-pendiente__meta">
                      {t(TEXTOS_CLAVES.semanaCorte)}: <strong>{quiz.semana_corte}</strong>
                    </div>
                  )}

                  <div>
                    <p className="tarjeta-pendiente__meta">
                      <strong>{t(TEXTOS_CLAVES.apertura)}:</strong> {formatearFecha(quiz.fecha_apertura) || '—'}
                    </p>
                    <p className="tarjeta-pendiente__meta">
                      <strong>{t(TEXTOS_CLAVES.cierre)}:</strong> {formatearFecha(quiz.fecha_cierre) || '—'}
                    </p>
                    {quiz.tiempo_limite_min != null && (
                      <p className="tarjeta-pendiente__meta">
                        <strong>{t(TEXTOS_CLAVES.tiempoLimite)}:</strong>{' '}
                        {t('quizList.minutesShort', { count: quiz.tiempo_limite_min })}
                      </p>
                    )}
                  </div>

                  {resultado && (
                    <p className="tarjeta-pendiente__meta quiz-respondido">
                      {`${t(TEXTOS_CLAVES.respondido)}${textoNota(resultado)}`}
                    </p>
                  )}

                  <div className="tarjeta-pendiente__acciones">
                    {esDocente ? (
                      <BotonExportarPdf
                        onExportar={() => exportarQuizPdf(quiz.id_quiz)}
                        etiqueta={t(TEXTOS_CLAVES.botonExportarQuiz)}
                        ariaLabel={t(TEXTOS_CLAVES.botonExportarQuizAria, { title: quiz.titulo })}
                      />
                    ) : (
                      <Link
                        to={`/estudiante/quices/${quiz.id_quiz}`}
                        className={`btn ${resultado ? 'btn-secondary' : 'btn-primary'}`}
                      >
                        {t(accion)}
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
