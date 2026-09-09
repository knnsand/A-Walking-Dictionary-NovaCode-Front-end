import { useEffect, useState, useCallback } from 'react';
import { listarTarjetasPendientes, listarTarjetasAprobadas, aprobarTarjeta, rechazarTarjeta, actualizarContextoTarjeta } from '../../cliente-api/tarjetasApi';
import { listarCitasPendientes, aprobarCita, declinarCita } from '../../cliente-api/citasApi';
import { TarjetaPendienteCard } from './TarjetaPendienteCard';
import { CitaPendienteCard } from './CitaPendienteCard';
import { EtiquetaContextoModal } from './EtiquetaContextoModal';
import { Aviso } from '../../componentes/comunes/Aviso';

const TABS = [
  { id: 'nuevos', label: 'Nuevos Términos' },
  { id: 'citas', label: 'Citas y Sentidos' },
  { id: 'historial', label: 'Historial Aprobadas' },
];

/**
 * Vista principal de HU-004 y HU-005.
 *
 * HU-004: lista tarjetas pendientes, permite editar y rechazar.
 * HU-005: asignar registro y variante regional es un paso OBLIGATORIO
 * antes de aprobar -- al presionar "Aprobar" se abre
 * EtiquetaContextoModal (ver tarjetaParaAprobar); solo al confirmar
 * el contexto ahí se ejecutan juntas aprobarTarjeta() y
 * actualizarContextoTarjeta(). Si el docente cancela el modal, la
 * tarjeta permanece pendiente sin cambios.
 */
export function RevisionPalabras() {
  const [tabActivo, setTabActivo] = useState('nuevos');
  const [pendientes, setPendientes] = useState([]);
  const [aprobadas, setAprobadas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const [tarjetaParaAprobar, setTarjetaParaAprobar] = useState(null);
  const [guardandoAprobacion, setGuardandoAprobacion] = useState(false);
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });

  const cargarPendientes = useCallback(() => {
    listarTarjetasPendientes().then(setPendientes);
  }, []);

  const cargarAprobadas = useCallback(() => {
    listarTarjetasAprobadas().then(setAprobadas);
  }, []);

  const cargarCitas = useCallback(() => {
    listarCitasPendientes().then(setCitas);
  }, []);

  useEffect(() => {
    cargarPendientes();
    cargarAprobadas();
    cargarCitas();
  }, [cargarPendientes, cargarAprobadas, cargarCitas]);

  // HU-004: click en "Aprobar" ya no aprueba directo -- abre el modal
  // de contexto (HU-005) guardando también las ediciones pendientes.
  function handleSolicitarAprobacion(tarjeta, datosEditados) {
    setTarjetaParaAprobar({ ...tarjeta, ...datosEditados });
  }

  // HU-005: se confirma el contexto -> se aprueba la tarjeta con las
  // ediciones y el contexto juntos, como una sola acción del usuario.
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

  async function handleRechazar(id) {
    try {
      await rechazarTarjeta(id);
      setAviso({ tipo: 'exito', mensaje: 'Tarjeta rechazada.' });
      cargarPendientes();
    } catch (error) {
      setAviso({ tipo: 'error', mensaje: `No se pudo rechazar la tarjeta: ${error.message}` });
    }
  }

  async function handleAprobarCita(idCita) {
    try {
      await aprobarCita(idCita);
      setAviso({ tipo: 'exito', mensaje: 'Cita aprobada.' });
      cargarCitas();
    } catch (error) {
      setAviso({ tipo: 'error', mensaje: `No se pudo aprobar la cita: ${error.message}` });
    }
  }

  async function handleDeclinarCita(idCita) {
    try {
      await declinarCita(idCita);
      setAviso({ tipo: 'exito', mensaje: 'Cita declinada.' });
      cargarCitas();
    } catch (error) {
      setAviso({ tipo: 'error', mensaje: `No se pudo declinar la cita: ${error.message}` });
    }
  }

  return (
    <div className="card-mazo">
      <div className="card-mazo__header">
        <div className="card-mazo__icon" aria-hidden="true" />
        <div>
          <h2 className="card-mazo__title">Revisión de Vocabulario y Citas Literarias</h2>
          <p className="card-mazo__subtitle">
            Valida las propuestas de términos sometidas por los estudiantes del curso.
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
            {tab.id === 'citas' && citas.length > 0 && (
              <span className="sidebar__badge">{citas.length}</span>
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
                onRechazar={() => handleRechazar(tarjeta.id_tarjeta)}
              />
            ))
          )
        )}

        {/* Fuera de alcance de HU-004/HU-005 -- ver nota en citasMock.js */}
        {tabActivo === 'citas' && (
          citas.length === 0 ? (
            <p className="empty-state">No hay citas pendientes de revisión.</p>
          ) : (
            citas.map((cita) => (
              <CitaPendienteCard
                key={cita.id_cita}
                cita={cita}
                onAprobar={handleAprobarCita}
                onDeclinar={handleDeclinarCita}
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