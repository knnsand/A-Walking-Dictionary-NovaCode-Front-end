/**
 * @file MazoItem.jsx
 * @brief Tarjeta de un mazo de estudio dentro de la lista de mazos.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { Link } from 'react-router-dom';
import { actualizarEstadoMazo } from '../../../cliente-api/mazosApi';
import { exportarMazoPdf } from '../../../cliente-api/exportacionesApi';
import { BotonExportarPdf } from '../../../componentes/comunes/BotonExportarPdf';
import { VARIANTE_REGIONAL_CLAVES } from './crearMazo.constants';

/** @brief Cantidad de colores de tarjeta; el color se elige según la semana del mazo. */
const CANTIDAD_COLORES = 5;

/**
 * @brief Tarjeta de un mazo. Todos los roles ven la información del mazo;
 * las acciones dependen del rol:
 * - docente: abrir / cerrar el mazo y exportarlo a PDF (HU-3.3).
 * - estudiante: ir a estudiar las palabras del mazo.
 * - invitado: solo lectura (sin acciones).
 * @param {Object} props
 * @param {Object} props.mazo - Mazo a mostrar.
 * @param {string} [props.rol] - 'docente' | 'estudiante' | 'invitado'.
 * @param {Function} [props.onEstadoActualizado] - Recibe el mazo después de abrirlo o cerrarlo.
 * @return {JSX.Element}
 */
export function MazoItem({ mazo, rol = 'docente', onEstadoActualizado }) {
  const { t } = useTranslation();
  const [guardando, setGuardando] = useState(false);
  // Guarda la CLAVE de traducción del error (no el texto); se traduce al mostrarlo.
  const [error, setError] = useState(null);

  const abierto = mazo.estado === 'abierto';
  const color = (Number(mazo.semana) || 0) % CANTIDAD_COLORES;

  // La variante se guarda en español en la base de datos; aquí solo se traduce
  // lo que se muestra. Si llegara un valor desconocido, se muestra tal cual.
  const claveVariante =
    VARIANTE_REGIONAL_CLAVES[mazo.variante_regional_predeterminada];
  const variante = claveVariante
    ? t(claveVariante)
    : mazo.variante_regional_predeterminada;

  /** @brief Abre el mazo si está cerrado o lo cierra si está abierto. */
  async function handleCambiarEstado() {
    const nuevoEstado = abierto ? 'cerrado' : 'abierto';

    setGuardando(true);
    setError(null);
    try {
      const mazoActualizado = await actualizarEstadoMazo(
        mazo.id_mazo,
        nuevoEstado
      );
      onEstadoActualizado?.(mazoActualizado);
    } catch (e) {
      console.error(e);
      setError('deckCard.errors.changeStateFailed');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <li className={`mazo-pila mazo-card--color-${color}`}>
      <div
        className={`mazo-pila__cara mazo-card${abierto ? '' : ' mazo-card--cerrado'}`}
      >
        <div className="mazo-card__cabecera">
          <span className="mazo-card__semana">
            {t('deckCard.week', { week: mazo.semana })}
          </span>
        </div>

        <h3 className="mazo-card__titulo">{mazo.nombre_lectura}</h3>
        <p className="mazo-card__autor">{mazo.autor}</p>

        {mazo.variante_regional_predeterminada && (
          <ul
            className="mazo-card__etiquetas"
            aria-label={t('deckCard.regionalVariant')}
          >
            <li className="mazo-card__etiqueta">{variante}</li>
          </ul>
        )}

        <div className="mazo-card__pie">
          <span className="mazo-card__estado-texto">
            {abierto ? t('deckCard.status.open') : t('deckCard.status.closed')}
          </span>

          {rol === 'docente' && (
            <div className="mazo-card__acciones">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCambiarEstado}
                disabled={guardando}
                aria-label={
                  abierto
                    ? t('deckCard.aria.close', { name: mazo.nombre_lectura })
                    : t('deckCard.aria.open', { name: mazo.nombre_lectura })
                }
              >
                {guardando
                  ? t('deckCard.actions.saving')
                  : abierto
                    ? t('deckCard.actions.close')
                    : t('deckCard.actions.open')}
              </button>

              {/* HU-3.3 (CA-3.3.1): solo la docente exporta; el backend responde 403 a otros roles. */}
              <BotonExportarPdf
                onExportar={() => exportarMazoPdf(mazo.id_mazo)}
                etiqueta={t('exportActions.deckPdf')}
                ariaLabel={t('exportActions.deckPdfAria', { name: mazo.nombre_lectura })}
              />
            </div>
          )}

          {rol === 'estudiante' && (
            <button
              className="btn btn-secondary"
              type="button"
              disabled
              aria-label={t('deckCard.aria.study', { name: mazo.nombre_lectura })}
            >
              {t('deckCard.actions.viewWords')}
            </button>
          )}
        </div>

        {error && (
          <p className="mazo-card__error" role="alert">
            {t(error)}
          </p>
        )}
      </div>
    </li>
  );
}