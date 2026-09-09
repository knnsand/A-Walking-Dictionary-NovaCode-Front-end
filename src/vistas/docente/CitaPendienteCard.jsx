/**
 * NOTA DE ALCANCE: ver comentario en citasMock.js — funcionalidad
 * fuera de HU-004/HU-005, construida por paridad visual con el
 * mockup de referencia.
 */
export function CitaPendienteCard({ cita, onAprobar, onDeclinar }) {
  return (
    <div className="tarjeta-pendiente">
      <div className="tarjeta-pendiente__encabezado">
        <h3 className="tarjeta-pendiente__palabra">{cita.palabra}</h3>
        <span className="badge badge-abierto">{cita.tipo_gramatical}</span>
        <span className="tag-contexto">{cita.etiqueta}</span>
      </div>

      <p>{cita.sentido}</p>

      <div className="tarjeta-pendiente__cita">
        "{cita.texto_cita}"
        <span className="tarjeta-pendiente__cita-autor">— {cita.fuente}</span>
      </div>

      <p className="tarjeta-pendiente__meta">Aportado por <strong>{cita.estudiante}</strong></p>

      <div className="tarjeta-pendiente__acciones">
        <button className="btn btn-primary" onClick={() => onAprobar(cita.id_cita)}>Aprobar Cita</button>
        <button className="btn btn-rechazar" onClick={() => onDeclinar(cita.id_cita)}>Declinar</button>
      </div>
    </div>
  );
}