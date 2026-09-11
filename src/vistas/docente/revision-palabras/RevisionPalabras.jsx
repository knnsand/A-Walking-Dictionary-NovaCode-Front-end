import { useEffect, useState, useCallback } from 'react';
import { listarTarjetasPendientes, listarTarjetasAprobadas, aprobarTarjeta, actualizarContextoTarjeta } from '../../../cliente-api/tarjetasApi';
import { listarCoautoriasPendientes, aprobarCoautoria, rechazarCoautoria } from '../../../cliente-api/coautoriaApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { TarjetaPendienteCard } from './TarjetaPendienteCard';
import { CoautoriaPendienteCard } from '../coautoria/CoautoriaPendienteCard';
import { EtiquetaContextoModal } from './EtiquetaContextoModal';
import { TABS } from './revisionPalabras.constants';

import './revision-palabras.css';

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

  const cargarPendientes = useCallback(() => {
    listarTarjetasPendientes().then(setPendientes);
  }, []);

  const cargarAprobadas = useCallback(() => {
    listarTarjetasAprobadas().then(setAprobadas);
  }, []);

  const cargarCoautorias = useCallback(() => {
    listarCoautoriasPendientes().then(setCoautorias);
  }, []);

  useEffect(() => {
    cargarPendientes();
    cargarAprobadas();
    cargarCoautorias();
  }, [cargarPendientes, cargarAprobadas, cargarCoautorias]);

  function handleSolicitarAprobacion(tarjeta, datosEditados) {
    setTarjetaParaAprobar({ ...tarjeta, ...datosEditados });
  }

  async function handleConfirmarAprobacion(contexto) {
    const { id_tarjeta, traduccion, definicion, ejemplo } = tarjetaParaAprobar;
    setGuardandoAprobacion(true);
    try {
      await aprobarTarjeta(id_tarjeta, { traduccion, definicion, ejemplo });
      await actualizarContextoTarjeta(id_tarjeta, contexto);
      setAviso({ tipo: 'exito', mensaje: 'Tarjeta aprobada con su contexto lingüístico y habilitada para el quiz.' });
      setIdEnEdicion(null);
      setTarjetaParaAprobar(null);
      cargarPendientes();
      cargarAprobadas();
    } catch (error) {
      setAviso({ tipo: 'error', mensaje: `No se pudo completar la aprobación: ${error.message}` });
    } finally {
      setGuardandoAprobacion(false);
    }
  }

  async function handleAprobarCoautoria(idCoautoria, datosEditados) {
    try {
      await aprobarCoautoria(idCoautoria, datosEditados);
      setAviso({ tipo: 'exito', mensaje: 'Coautoría aprobada.' });
      setIdCoautoriaEnEdicion(null);
      cargarCoautorias();
    } catch (error) {
      setAviso({ tipo: 'error', mensaje: `No se pudo aprobar la coautoría: ${error.message}` });
    }
  }

  async function handleRechazarCoautoria(idCoautoria) {
    try {
      await rechazarCoautoria(idCoautoria);
      setAviso({ tipo: 'exito', mensaje: 'Coautoría rechazada.' });
      cargarCoautorias();
    } catch (error) {
      setAviso({ tipo: 'error', mensaje: `No se pudo rechazar la coautoría: ${error.message}` });
    }
  }

  return (
    <div className="card-mazo">
      <div className="card-mazo__header">
        <div className="card-mazo__icon" aria-hidden="true" />
        <div>
          <h2 className="card-mazo__title">Revisión de Vocabulario y Coautorías</h2>
          <p className="card-mazo__subtitle">
            Valida las propuestas de términos y coautorías sometidas por los estudiantes del curso.
          </p>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Secciones de revisión">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tabActivo === tab.id}
            className={`tabs__item ${tabActivo === tab.id ? 'tabs__item--activo' : ''}`}
            onClick={() => setTabActivo(tab.id)}
          >
            {tab.label}
            {tab.id === 'nuevos' && pendientes.length > 0 && (
              <span className="sidebar__badge">{pendientes.length}</span>
            )}
            {tab.id === 'coautoria' && coautorias.length > 0 && (
              <span className="sidebar__badge">{coautorias.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="card-mazo__body">
        <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />

        {tabActivo === 'nuevos' && (
          pendientes.length === 0 ? (
            <p className="empty-state">No hay palabras pendientes de revisión.</p>
          ) : (
            pendientes.map((tarjeta) => (
              <TarjetaPendienteCard
                key={tarjeta.id_tarjeta}
                tarjeta={tarjeta}
                enEdicion={idEnEdicion === tarjeta.id_tarjeta}
                onIniciarEdicion={() => setIdEnEdicion(tarjeta.id_tarjeta)}
                onCancelarEdicion={() => setIdEnEdicion(null)}
                onAprobar={(datosEditados) => handleSolicitarAprobacion(tarjeta, datosEditados)}
              />
            ))
          )
        )}

        {tabActivo === 'coautoria' && (
          coautorias.length === 0 ? (
            <p className="empty-state">No hay coautorías pendientes de revisión.</p>
          ) : (
            coautorias.map((coautoria) => (
              <CoautoriaPendienteCard
                key={coautoria.id_coautoria}
                coautoria={coautoria}
                enEdicion={idCoautoriaEnEdicion === coautoria.id_coautoria}
                onIniciarEdicion={() => setIdCoautoriaEnEdicion(coautoria.id_coautoria)}
                onCancelarEdicion={() => setIdCoautoriaEnEdicion(null)}
                onAprobar={(datosEditados) => handleAprobarCoautoria(coautoria.id_coautoria, datosEditados)}
                onRechazar={() => handleRechazarCoautoria(coautoria.id_coautoria)}
              />
            ))
          )
        )}

        {tabActivo === 'historial' && (
          aprobadas.length === 0 ? (
            <p className="empty-state">Todavía no hay tarjetas aprobadas.</p>
          ) : (
            <div className="grid-aprobadas">
              {aprobadas.map((tarjeta) => (
                <div className="card-aprobada" key={tarjeta.id_tarjeta}>
                  <div className="card-aprobada__encabezado">
                    <strong>{tarjeta.palabra}</strong>
                    <span className="badge badge-abierto">Publicada</span>
                  </div>
                  <p className="card-aprobada__definicion">{tarjeta.definicion}</p>
                  {tarjeta.registro && <span className="tag-contexto">{tarjeta.registro}</span>}
                  {tarjeta.variante_regional && <span className="tag-contexto">{tarjeta.variante_regional}</span>}
                  <p className="card-aprobada__autor">Aporte: {tarjeta.estudiante}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {tarjetaParaAprobar && (
        <EtiquetaContextoModal
          tarjeta={tarjetaParaAprobar}
          onCerrar={() => setTarjetaParaAprobar(null)}
          onConfirmar={handleConfirmarAprobacion}
          guardando={guardandoAprobacion}
        />
      )}
    </div>
  );
}