import { useState } from 'react';

/**
 * Tarjeta individual de la pestaña "Coautoría" (dentro de RevisionPalabras.jsx).
 * Muestra un aporte de tipo 'coautoria' o 'acepcion_nueva' sobre una tarjeta ya
 * existente, comparado contra la tarjeta original, según el modelo real del DER
 * (tabla aporte + tarjeta, ver AporteRepository.listarCoautoriasPendientes).
 */
export function CoautoriaPendienteCard({
  coautoria, enEdicion, onIniciarEdicion, onCancelarEdicion, onAprobar, onRechazar,
}) {
  const [borrador, setBorrador] = useState({
    traduccion_aportada: coautoria.traduccion_aportada,
    definicion_aportada: coautoria.definicion_aportada,
    ejemplo_aportado: coautoria.ejemplo_aportado ?? '',
  });

  function handleChange(evento) {
    const { name, value } = evento.target;
    setBorrador((anterior) => ({ ...anterior, [name]: value }));
  }

  const esCoautoriaExacta = coautoria.tipo_aporte === 'coautoria';

  return (
    <div className="tarjeta-pendiente">
      <div className="tarjeta-pendiente__encabezado">
        <h3 className="tarjeta-pendiente__palabra">{coautoria.palabra_tarjeta}</h3>
        <span className="badge badge-abierto">
          {esCoautoriaExacta ? 'Coautoría' : 'Acepción nueva'}
        </span>
      </div>

      <div className="tarjeta-pendiente__original">
        <p className="tarjeta-pendiente__meta">Definición existente en el mazo:</p>
        <p>{coautoria.definicion_tarjeta}</p>
        <p className="tarjeta-pendiente__meta">Traducción existente: {coautoria.traduccion_tarjeta}</p>
      </div>

      {enEdicion ? (
        <>
          <div className="form-group">
            <label className="form-label" htmlFor={`traduccion-${coautoria.id_aporte}`}>Traducción aportada</label>
            <input
              id={`traduccion-${coautoria.id_aporte}`}
              className="form-input"
              name="traduccion_aportada"
              value={borrador.traduccion_aportada}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor={`definicion-${coautoria.id_aporte}`}>Definición aportada</label>
            <textarea
              id={`definicion-${coautoria.id_aporte}`}
              className="form-textarea"
              name="definicion_aportada"
              rows={3}
              value={borrador.definicion_aportada}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor={`ejemplo-${coautoria.id_aporte}`}>Ejemplo aportado</label>
            <textarea
              id={`ejemplo-${coautoria.id_aporte}`}
              className="form-textarea"
              name="ejemplo_aportado"
              rows={2}
              value={borrador.ejemplo_aportado}
              onChange={handleChange}
            />
          </div>
        </>
      ) : (
        <>
          <p className="tarjeta-pendiente__meta">Aporte nuevo:</p>
          <p><strong>Traducción:</strong> {coautoria.traduccion_aportada}</p>
          <p><strong>Definición:</strong> {coautoria.definicion_aportada}</p>
          {coautoria.ejemplo_aportado && (
            <div className="tarjeta-pendiente__cita">
              "{coautoria.ejemplo_aportado}"
            </div>
          )}
        </>
      )}

      <div className="tarjeta-pendiente__acciones">
        {enEdicion ? (
          <>
            <button className="btn btn-primary" onClick={() => onAprobar(borrador)}>Guardar y aprobar</button>
            <button className="btn btn-secondary" onClick={onCancelarEdicion}>Cancelar</button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" onClick={() => onAprobar(borrador)}>Aprobar</button>
            <button className="btn btn-secondary" onClick={onIniciarEdicion}>Editar</button>
            <button className="btn btn-rechazar" onClick={onRechazar}>Rechazar</button>
          </>
        )}
      </div>
    </div>
  );
}