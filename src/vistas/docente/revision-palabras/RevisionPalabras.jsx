/**
 * @file RevisionPalabras.jsx
 * @brief Panel de revisión de la docente: términos nuevos e historial de aprobadas (HU-004, HU-005).
 */

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  listarTarjetasPendientes,
  listarTarjetasAprobadas,
  editarTarjeta,
  aprobarTarjeta,
  actualizarContextoTarjeta
} from '../../../cliente-api/tarjetasApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { TarjetaPendienteCard } from './TarjetaPendienteCard';
import { EtiquetaContextoModal } from './EtiquetaContextoModal';
import { TABS, REGISTRO_CLAVES } from './revisionPalabras.constants';
import { VARIANTE_REGIONAL_CLAVES } from '../crear-mazo/crearMazo.constants';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';

import './revision-palabras.css';

/**
 * @brief Clave de traducción del nombre de cada lista, tal como se mostrará en el aviso
 * si su actualización falla (se traduce al mostrarlo).
 */
const NOMBRES_LISTAS = {
  pendientes: 'reviewPage.lists.pending',
  aprobadas: 'reviewPage.lists.approved',
};

/**
 * @brief Pantalla con pestañas para revisar y aprobar las tarjetas pendientes.
 * @return {JSX.Element}
 */
export function RevisionPalabras() {
  const { t, i18n } = useTranslation();
  const [tabActivo, setTabActivo] = useState('nuevos');
  const [pendientes, setPendientes] = useState([]);
  const [aprobadas, setAprobadas] = useState([]);
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const [tarjetaParaAprobar, setTarjetaParaAprobar] = useState(null);
  const [guardandoAprobacion, setGuardandoAprobacion] = useState(false);
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });

  // Actualización manual del panel de revisión.
  const [actualizando, setActualizando] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [listasConError, setListasConError] = useState([]);

  // El título y subtítulo de la página los pinta el layout.
  useEncabezadoPagina(
    t('reviewPage.title'),
    t('reviewPage.subtitle')
  );

  /** @brief Carga las tarjetas pendientes de revisión. */
  const cargarPendientes = useCallback(() => {
    return listarTarjetasPendientes().then(setPendientes);
  }, []);

  /** @brief Carga el historial de tarjetas aprobadas. */
  const cargarAprobadas = useCallback(() => {
    return listarTarjetasAprobadas().then(setAprobadas);
  }, []);

  /**
   * @brief Consulta las dos listas en paralelo.
   * Si una falla, las demás se actualizan y la lista que falló
   * conserva los datos que ya estaban visibles.
   */
  const consultarListas = useCallback(async () => {
    try {
      const [rPendientes, rAprobadas] =
        await Promise.allSettled([
          listarTarjetasPendientes(),
          listarTarjetasAprobadas(),
        ]);

      const fallidas = [];

      function aplicar(resultado, guardar, nombre) {
        if (resultado.status === 'fulfilled') {
          guardar(resultado.value);
          return;
        }

        console.error(`Error al actualizar ${nombre}:`, resultado.reason);
        fallidas.push(nombre);
      }

      aplicar(
        rPendientes,
        setPendientes,
        NOMBRES_LISTAS.pendientes
      );

      aplicar(
        rAprobadas,
        setAprobadas,
        NOMBRES_LISTAS.aprobadas
      );

      setListasConError(fallidas);

      // La hora solo se actualiza si al menos una lista
      // se pudo consultar correctamente.
      if (fallidas.length < 2) {
        setUltimaActualizacion(new Date());
      }
    } finally {
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    void consultarListas();
  }, [consultarListas]);

  /** @brief Recarga manualmente las dos listas (si no hay una recarga en curso). */
  function handleActualizar() {
    if (actualizando) return;

    setActualizando(true);
    void consultarListas();
  }

  /**
   * @brief Guarda la tarjeta a aprobar (con sus correcciones) y abre el modal de contexto.
   * @param {Object} tarjeta - Tarjeta pendiente.
   * @param {Object} datosEditados - Traducción, definición y ejemplo corregidos.
   */
  function handleSolicitarAprobacion(tarjeta, datosEditados) {
    setTarjetaParaAprobar({
      ...tarjeta,
      ...datosEditados
    });
  }

  /**
   * @brief Guarda las correcciones, aprueba la tarjeta y le asigna el contexto lingüístico.
   * @param {{registro: string, variante_regional: string}} contexto - Elegido en el modal.
   */
  async function handleConfirmarAprobacion(contexto) {
    const {
      id_tarjeta,
      traduccion,
      definicion,
      ejemplo
    } = tarjetaParaAprobar;

    setGuardandoAprobacion(true);

    try {
      await editarTarjeta(id_tarjeta, {
        traduccion,
        definicion,
        ejemplo
      });

      await aprobarTarjeta(id_tarjeta);

      await actualizarContextoTarjeta(
        id_tarjeta,
        contexto
      );

      setAviso({
        tipo: 'exito',
        mensaje: t('reviewPage.success.approved')
      });

      setIdEnEdicion(null);
      setTarjetaParaAprobar(null);

      void cargarPendientes();
      void cargarAprobadas();
    } catch (error) {
      // error.message viene del backend y puede estar en español (pendiente de revisar).
      setAviso({
        tipo: 'error',
        mensaje: t('reviewPage.errors.approvalFailed', { message: error.message })
      });
    } finally {
      setGuardandoAprobacion(false);
    }
  }

  // La hora se formatea según el idioma activo (en inglés: "09:41 AM").
  const horaActualizacion = ultimaActualizacion
    ? ultimaActualizacion.toLocaleTimeString(i18n.language, {
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  const mensajeErrorActualizacion =
    listasConError.length > 0
      ? t('reviewPage.errors.refreshFailed', {
          lists: listasConError.map((clave) => t(clave)).join(', ')
        })
      : null;

  /**
   * @brief Registro y variante se guardan en español en la base de datos;
   * aquí solo se traduce lo que se muestra (si el valor no se conoce, se muestra tal cual).
   */
  const textoRegistro = (valor) =>
    REGISTRO_CLAVES[valor] ? t(REGISTRO_CLAVES[valor]) : valor;
  const textoVariante = (valor) =>
    VARIANTE_REGIONAL_CLAVES[valor] ? t(VARIANTE_REGIONAL_CLAVES[valor]) : valor;

  return (
    <div className="revision-palabras">

      <div className="revision-actualizar">
        <span
          className="revision-actualizar__hora"
          aria-live="polite"
        >
          {t('reviewPage.lastUpdated')}{' '}
          {horaActualizacion ?? '—'}
        </span>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleActualizar}
          disabled={actualizando}
        >
          {actualizando
            ? t('reviewPage.refreshing')
            : t('reviewPage.refresh')}
        </button>
      </div>

      <div
        className="tabs"
        role="tablist"
        aria-label={t('reviewPage.sectionsLabel')}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={
              tabActivo === tab.id
            }
            className={`tabs__item ${
              tabActivo === tab.id
                ? 'tabs__item--activo'
                : ''
            }`}
            onClick={() =>
              setTabActivo(tab.id)
            }
          >
            {t(tab.labelKey)}

            {tab.id === 'nuevos' &&
              pendientes.length > 0 && (
                <span className="sidebar__badge">
                  {pendientes.length}
                </span>
              )}
          </button>
        ))}
      </div>

      <Aviso
        tipo="error"
        mensaje={mensajeErrorActualizacion}
      />

      <Aviso
        tipo={aviso.tipo}
        mensaje={aviso.mensaje}
      />

      {tabActivo === 'nuevos' && (
        pendientes.length === 0 ? (
          <p className="empty-state">
            {t('reviewPage.empty.pending')}
          </p>
        ) : (
          <div className="revision-grid">
            {pendientes.map((tarjeta) => (
              <div
                key={tarjeta.id_tarjeta}
                className={`mazo-pila mazo-pila--sola pila--pendiente${
                  idEnEdicion === tarjeta.id_tarjeta
                    ? ' pila--editando'
                    : ''
                }`}
              >
                <TarjetaPendienteCard
                  tarjeta={tarjeta}
                  enEdicion={
                    idEnEdicion === tarjeta.id_tarjeta
                  }
                  onIniciarEdicion={() =>
                    setIdEnEdicion(
                      tarjeta.id_tarjeta
                    )
                  }
                  onCancelarEdicion={() =>
                    setIdEnEdicion(null)
                  }
                  onAprobar={(datosEditados) =>
                    handleSolicitarAprobacion(
                      tarjeta,
                      datosEditados
                    )
                  }
                />
              </div>
            ))}
          </div>
        )
      )}

      {tabActivo === 'historial' && (
        aprobadas.length === 0 ? (
          <p className="empty-state">
            {t('reviewPage.empty.history')}
          </p>
        ) : (
          <div className="revision-grid">
            {aprobadas.map((tarjeta) => (
              <div
                className="mazo-pila mazo-pila--sola pila--aprobada"
                key={tarjeta.id_tarjeta}
              >
                <div className="card-aprobada mazo-pila__cara">
                  <div className="card-aprobada__encabezado">
                    <strong>
                      {tarjeta.palabra}
                    </strong>

                    <span className="badge badge-abierto">
                      {t('reviewPage.history.published')}
                    </span>
                  </div>

                  <p className="card-aprobada__definicion">
                    {tarjeta.definicion}
                  </p>

                  {tarjeta.registro && (
                    <span className="tag-contexto">
                      {textoRegistro(tarjeta.registro)}
                    </span>
                  )}

                  {tarjeta.variante_regional && (
                    <span className="tag-contexto">
                      {textoVariante(tarjeta.variante_regional)}
                    </span>
                  )}

                  <p className="card-aprobada__autor">
                    {t('reviewPage.history.contributedBy', { name: tarjeta.estudiante })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tarjetaParaAprobar && (
        <EtiquetaContextoModal
          tarjeta={tarjetaParaAprobar}
          onCerrar={() =>
            setTarjetaParaAprobar(null)
          }
          onConfirmar={
            handleConfirmarAprobacion
          }
          guardando={guardandoAprobacion}
        />
      )}

    </div>
  );
}