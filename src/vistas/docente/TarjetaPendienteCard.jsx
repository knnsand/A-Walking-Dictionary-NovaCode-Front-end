import { useState } from 'react';

/**
 * Tarjeta individual del panel de Revisión de Palabras (HU-004).
 * Es específica de la curaduría docente (EPIC-002), por eso vive en
 * vistas/docente y no en componentes/comunes.
 *
 * - Modo lectura: muestra el aporte del estudiante y sus acciones
 *   (Aprobar / Editar / Rechazar).
 * - Modo edición: convierte traducción, definición y ejemplo en
 *   campos editables para que el docente corrija antes de aprobar
 *   (criterio de aceptación de HU-004).
 */
export function TarjetaPendienteCard({
  tarjeta, enEdicion, onIniciarEdicion, onCancelarEdicion, onAprobar, onRechazar,
}) {
  const [borrador, setBorrador] = useState({
    traduccion: tarjeta.traduccion,
    definicion: tarjeta.definicion,
    ejemplo: tarjeta.ejemplo,
  });

  function handleChange(evento) {
    const { name, value } = evento.target;
    setBorrador((anterior) => ({ ...anterior, [name]: value }));
  }

  return (
    <div className="tarjeta-pendiente">
      <div className="tarjeta-pendiente__encabezado">
        <h3 className="tarjeta-pendiente__palabra">{tarjeta.palabra}</h3>
        <span className="badge badge-abierto">{tarjeta.tipo_gramatical}</span>
        {tarjeta.registro && <span className="tag-contexto">{tarjeta.registro}</span>}
        {tarjeta.variante_regional && <span className="tag-contexto">{tarjeta.variante_regional}</span>}
      </div>

      {enEdicion ? (
        <>
          <div className="form-group">
            <label className="form-label" htmlFor={`traduccion-${tarjeta.id_tarjeta}`}>Traducción</label>
            <input
              id={`traduccion-${tarjeta.id_tarjeta}`}
              className="form-input"
              name="traduccion"
              value={borrador.traduccion}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor={`definicion-${tarjeta.id_tarjeta}`}>Definición</label>
            <textarea
              id={`definicion-${tarjeta.id_tarjeta}`}
              className="form-textarea"
              name="definicion"
              rows={2}
              value={borrador.definicion}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor={`ejemplo-${tarjeta.id_tarjeta}`}>Ejemplo de uso (máx. 150 car.)</label>
            <textarea
              id={`ejemplo-${tarjeta.id_tarjeta}`}
              className="form-textarea"
              name="ejemplo"
              rows={2}
              maxLength={150}
              value={borrador.ejemplo}
              onChange={handleChange}
            />
          </div>
        </>
      ) : (
        <>
          <p><strong>Definición:</strong> {tarjeta.definicion}</p>
          <div className="tarjeta-pendiente__cita">
            "{tarjeta.ejemplo}"
            <span className="tarjeta-pendiente__cita-autor">— Aportado por {tarjeta.estudiante}</span>
          </div>
        </>
      )}

      <p className="tarjeta-pendiente__meta">
        Propuesta por <strong>{tarjeta.estudiante}</strong> ({tarjeta.correo_estudiante}) el {tarjeta.fecha_aporte}
      </p>

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