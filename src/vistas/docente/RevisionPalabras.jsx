import { useEffect, useState, useCallback } from 'react';
import { listarTarjetasPendientes, listarTarjetasAprobadas, aprobarTarjeta, rechazarTarjeta } from '../../cliente-api/tarjetasApi';
import { TarjetaPendienteCard } from './TarjetaPendienteCard';
import { Aviso } from '../../componentes/comunes/Aviso';
import { listarCitasPendientes, aprobarCita, declinarCita } from '../../cliente-api/citasApi';
import { CitaPendienteCard } from './CitaPendienteCard';

const TABS = [
  { id: 'nuevos', label: 'Nuevos Términos' },
  { id: 'citas', label: 'Citas y Sentidos' },
  { id: 'historial', label: 'Historial Aprobadas' },
];

/**
 * Vista principal de HU-004.
 *
 * Organiza la curaduría docente en 3 pestañas, replicando la
 * estructura del mockup de referencia:
 * - "Nuevos Términos": tarjetas en pendiente_revision (flujo
 *   principal de HU-004: aprobar/editar/rechazar).
 * - "Citas y Sentidos": pendiente de definición formal en el
 *   backlog; placeholder por ahora.
 * - "Historial Aprobadas": tarjetas ya en revisado_docente,
 *   solo lectura.
 *
 * La conexión con EtiquetaContextoModal (HU-005) se agrega en la
 * rama feature/HU-005-etiquetas-contexto, una vez esta esté
 * mergeada en develop.
 */
export function RevisionPalabras() {
  const [tabActivo, setTabActivo] = useState('nuevos');
  const [pendientes, setPendientes] = useState([]);
  const [aprobadas, setAprobadas] = useState([]);
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const [citas, setCitas] = useState([]);
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

  async function handleAprobar(id, datosEditados) {
    try {
      await aprobarTarjeta(id, datosEditados);
      setAviso({ tipo: 'exito', mensaje: 'Tarjeta aprobada y habilitada para el quiz.' });
      setIdEnEdicion(null);
      cargarPendientes();
      cargarAprobadas();
    } catch (error) {
      setAviso({ tipo: 'error', mensaje: `No se pudo aprobar la tarjeta: ${error.message}` });
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
                onAprobar={(datosEditados) => handleAprobar(tarjeta.id_tarjeta, datosEditados)}
                onRechazar={() => handleRechazar(tarjeta.id_tarjeta)}
              />
            ))
          )
        )}

        {/* Fuera de alcance de HU-004/HU-005 — ver nota en citasMock.js */}
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
          <p className="card-aprobada__autor">Aporte: {tarjeta.estudiante}</p>
        </div>
      ))}
    </div>
  )
)}
      </div>
    </div>
  );
}