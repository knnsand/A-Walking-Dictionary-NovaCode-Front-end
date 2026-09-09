import { useState } from 'react';
import { Aviso } from '../../componentes/comunes/Aviso';

const REGISTROS = ['Formal', 'Informal', 'Slang', 'Coloquial', 'Anticuado'];
const VARIANTES_REGIONALES = ['Británico', 'Nigeriano', 'Jamaicano', 'Ghanés', 'Estadounidense'];

/**
 * HU-005: paso obligatorio antes de aprobar una tarjeta (EPIC-002).
 * Se abre automáticamente al presionar "Aprobar" en TarjetaPendienteCard;
 * el docente debe asignar registro y variante regional para poder
 * confirmar la aprobación. Si cancela, la tarjeta permanece pendiente.
 *
 * Campos según criterio de aceptación literal de HU-005: "La tarjeta
 * permite seleccionar registro (Formal, informal, slang, coloquial,
 * anticuado) y variante dialectal" -- 2 campos, no 3.
 *
 * No llama a la API directamente: delega en onConfirmar(contexto),
 * para que RevisionPalabras.jsx orqueste juntas la aprobación
 * (aprobarTarjeta) y el guardado de contexto (actualizarContextoTarjeta)
 * como una sola operación desde la perspectiva del usuario.
 */
export function EtiquetaContextoModal({ tarjeta, onCerrar, onConfirmar, guardando }) {
  const [registro, setRegistro] = useState(tarjeta.registro || '');
  const [varianteRegional, setVarianteRegional] = useState(tarjeta.variante_regional || '');
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });

  function handleConfirmar() {
    if (!registro || !varianteRegional) {
      setAviso({ tipo: 'error', mensaje: 'Selecciona un registro y una variante regional antes de aprobar.' });
      return;
    }
    onConfirmar({ registro, variante_regional: varianteRegional });
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={`Contexto de ${tarjeta.palabra}`}>
      <div className="card-mazo modal-card">
        <div className="card-mazo__header">
          <div className="card-mazo__icon" aria-hidden="true" />
          <div>
            <h2 className="card-mazo__title">Contexto lingüístico de "{tarjeta.palabra}"</h2>
            <p className="card-mazo__subtitle">Paso final antes de aprobar y habilitar para el quiz</p>
          </div>
        </div>

        <div className="card-mazo__body">
          <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />

          <div className="info-box">
            Esta tarjeta se aprobará solo al confirmar el contexto lingüístico a continuación.
          </div>

          <div className="form-group">
            <span className="form-label">Registro</span>
            <div className="chip-group" role="radiogroup" aria-label="Registro">
              {REGISTROS.map((opcion) => (
                <div className="chip-option" key={opcion}>
                  <input
                    type="radio"
                    id={`registro-${opcion}`}
                    name="registro"
                    checked={registro === opcion}
                    onChange={() => setRegistro(opcion)}
                  />
                  <label htmlFor={`registro-${opcion}`}>{opcion}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="variante-regional">Variante regional</label>
            <select
              id="variante-regional"
              className="form-select"
              value={varianteRegional}
              onChange={(evento) => setVarianteRegional(evento.target.value)}
            >
              <option value="">Selecciona una variante</option>
              {VARIANTES_REGIONALES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="card-mazo__footer">
          <button className="btn btn-secondary" onClick={onCerrar} disabled={guardando}>Cancelar (no aprobar)</button>
          <button className="btn btn-primary" onClick={handleConfirmar} disabled={guardando}>
            {guardando ? 'Aprobando...' : 'Confirmar y aprobar'}
          </button>
        </div>
      </div>
    </div>
  );
}