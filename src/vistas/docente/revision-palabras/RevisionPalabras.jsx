import { useEffect, useState, useCallback } from 'react';
import {
  listarTarjetasPendientes,
  listarTarjetasAprobadas,
  editarTarjeta,
  aprobarTarjeta,
  actualizarContextoTarjeta
} from '../../../cliente-api/tarjetasApi';
import {
  listarCoautoriasPendientes,
  aprobarCoautoria
} from '../../../cliente-api/coautoriaApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { TarjetaPendienteCard } from './TarjetaPendienteCard';
import { CoautoriaPendienteCard } from '../coautoria/CoautoriaPendienteCard';
import { EtiquetaContextoModal } from './EtiquetaContextoModal';
import { TABS } from './revisionPalabras.constants';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';

import './revision-palabras.css';

// Nombre de cada lista tal como se mostrará en el aviso si su actualización falla.
const NOMBRES_LISTAS = {
  pendientes: 'nuevos términos',
  aprobadas: 'historial',
  coautorias: 'coautorías',
};

export function RevisionPalabras() {
  const [tabActivo, setTabActivo] = useState('nuevos');
  const [pendientes, setPendientes] = useState([]);
  const [aprobadas, setAprobadas] = useState([]);
  const [coautorias, setCoautorias] = useState([]);
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const [idCoautoriaEnEdicion, setIdCoautoriaEnEdicion] = useState(null);
  const [tarjetaParaAprobar, setTarjetaParaAprobar] = useState(null);
  const [guardandoAprobacion, setGuardandoAprobacion] = useState(false);
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });

  // Actualización manual del panel de revisión.
  const [actualizando, setActualizando] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [listasConError, setListasConError] = useState([]);

  // El título y subtítulo de la página los pinta el layout.
  useEncabezadoPagina(
    'Revisión de Vocabulario y Coautorías',
    'Valida las propuestas de términos y coautorías sometidas por los estudiantes del curso.'
  );

  const cargarPendientes = useCallback(() => {
    listarTarjetasPendientes().then(setPendientes);
  }, []);

  const cargarAprobadas = useCallback(() => {
    listarTarjetasAprobadas().then(setAprobadas);
  }, []);

  const cargarCoautorias = useCallback(() => {
    listarCoautoriasPendientes().then(setCoautorias);
  }, []);

  // Consulta las tres listas en paralelo.
  // Si una falla, las demás se actualizan y la lista que falló
  // conserva los datos que ya estaban visibles.
  const consultarListas = useCallback(async () => {
    try {
      const [rPendientes, rAprobadas, rCoautorias] =
        await Promise.allSettled([
          listarTarjetasPendientes(),
          listarTarjetasAprobadas(),
          listarCoautoriasPendientes(),
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

      aplicar(
        rCoautorias,
        setCoautorias,
        NOMBRES_LISTAS.coautorias
      );

      setListasConError(fallidas);

      // La hora solo se actualiza si al menos una lista
      // se pudo consultar correctamente.
      if (fallidas.length < 3) {
        setUltimaActualizacion(new Date());
      }
    } finally {
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    consultarListas();
  }, [consultarListas]);

  function handleActualizar() {
    if (actualizando) return;

    setActualizando(true);
    consultarListas();
  }

  function handleSolicitarAprobacion(tarjeta, datosEditados) {
    setTarjetaParaAprobar({
      ...tarjeta,
      ...datosEditados
    });
  }

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
        mensaje:
          'Tarjeta aprobada con su contexto lingüístico y habilitada para el quiz.'
      });

      setIdEnEdicion(null);
      setTarjetaParaAprobar(null);

      cargarPendientes();
      cargarAprobadas();
    } catch (error) {
      setAviso({
        tipo: 'error',
        mensaje:
          `No se pudo completar la aprobación: ${error.message}`
      });
    } finally {
      setGuardandoAprobacion(false);
    }
  }

  async function handleAprobarCoautoria(
    idAporte,
    datosEditados
  ) {
    try {
      await aprobarCoautoria(
        idAporte,
        datosEditados
      );

      setAviso({
        tipo: 'exito',
        mensaje: 'Coautoría aprobada.'
      });

      setIdCoautoriaEnEdicion(null);
      cargarCoautorias();
    } catch (error) {
      setAviso({
        tipo: 'error',
        mensaje:
          `No se pudo aprobar la coautoría: ${error.message}`
      });
    }
  }

  const horaActualizacion = ultimaActualizacion
    ? ultimaActualizacion.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  const mensajeErrorActualizacion =
    listasConError.length > 0
      ? `No se pudo actualizar: ${listasConError.join(
          ', '
        )}. Se muestran los datos anteriores.`
      : null;

  return (
    <div className="revision-palabras">

      <div className="revision-actualizar">
        <span
          className="revision-actualizar__hora"
          aria-live="polite"
        >
          Última actualización:{' '}
          {horaActualizacion ?? '—'}
        </span>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleActualizar}
          disabled={actualizando}
        >
          {actualizando
            ? 'Actualizando…'
            : 'Actualizar'}
        </button>
      </div>

      <div
        className="tabs"
        role="tablist"
        aria-label="Secciones de revisión"
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
            {tab.label}

            {tab.id === 'nuevos' &&
              pendientes.length > 0 && (
                <span className="sidebar__badge">
                  {pendientes.length}
                </span>
              )}

            {tab.id === 'coautoria' &&
              coautorias.length > 0 && (
                <span className="sidebar__badge">
                  {coautorias.length}
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
            No hay palabras pendientes de revisión.
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

      {tabActivo === 'coautoria' && (
        coautorias.length === 0 ? (
          <p className="empty-state">
            No hay coautorías pendientes de revisión.
          </p>
        ) : (
          <div className="revision-grid">
            {coautorias.map((coautoria) => (
              <div
                key={coautoria.id_aporte}
                className={`mazo-pila mazo-pila--sola pila--coautoria${
                  idCoautoriaEnEdicion ===
                  coautoria.id_aporte
                    ? ' pila--editando'
                    : ''
                }`}
              >
                <CoautoriaPendienteCard
                  coautoria={coautoria}
                  enEdicion={
                    idCoautoriaEnEdicion ===
                    coautoria.id_aporte
                  }
                  onIniciarEdicion={() =>
                    setIdCoautoriaEnEdicion(
                      coautoria.id_aporte
                    )
                  }
                  onCancelarEdicion={() =>
                    setIdCoautoriaEnEdicion(null)
                  }
                  onAprobar={(datosEditados) =>
                    handleAprobarCoautoria(
                      coautoria.id_aporte,
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
            Todavía no hay tarjetas aprobadas.
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
                      Publicada
                    </span>
                  </div>

                  <p className="card-aprobada__definicion">
                    {tarjeta.definicion}
                  </p>

                  {tarjeta.registro && (
                    <span className="tag-contexto">
                      {tarjeta.registro}
                    </span>
                  )}

                  {tarjeta.variante_regional && (
                    <span className="tag-contexto">
                      {tarjeta.variante_regional}
                    </span>
                  )}

                  <p className="card-aprobada__autor">
                    Aporte: {tarjeta.estudiante}
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