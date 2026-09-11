import { useState } from 'react';

/**
 * Tarjeta individual de la pestaña "Coautoría" (dentro de
 * RevisionPalabras.jsx). Muestra el aporte de un estudiante distinto
 * al autor original de la palabra: una cita, ejemplo u otro
 * significado que complementa la tarjeta existente.
 *
 * Reutiliza las mismas clases CSS que TarjetaPendienteCard
 * (.tarjeta-pendiente, .btn, .badge, .tag-contexto) porque
 * visualmente son la misma "forma" de tarjeta -- no se creó CSS
 * nuevo para evitar duplicar estilos (ver revision-palabras.css).
 *
 * Tres acciones posibles (a diferencia de TarjetaPendienteCard, que
 * solo tiene Aprobar/Editar):
 * - Aprobar: la coautoría está alineada con la palabra (su cita,
 *   ejemplo o significado corresponde).
 * - Editar: el contenido es válido pero tiene errores de gramática,
 *   ortografía o redacción que la docente corrige antes de aprobar.
 * - Rechazar: el contenido no tiene relación real con la palabra.
 *   Aquí sí existe un criterio claro de rechazo (a diferencia de las
 *   tarjetas nuevas de HU-004, donde se quitó ese botón).
 */
export function CoautoriaPendienteCard({
  coautoria, enEdicion, onIniciarEdicion, onCancelarEdicion, onAprobar, onRechazar,
}) {
  // Borrador local: copia editable de los 3 campos que la docente
  // puede corregir. Se inicializa con los valores originales de la
  // coautoría y solo se "confirma" hacia arriba (vía onAprobar) si
  // la docente decide guardar los cambios.
  const [borrador, setBorrador] = useState({
    sentido: coautoria.sentido,
    texto_cita: coautoria.texto_cita,
    fuente: coautoria.fuente,
  });

  // Handler genérico de inputs controlados: usa el atributo `name`
  // del campo para saber qué propiedad del borrador actualizar, sin
  // necesitar un handler distinto por cada input/textarea.
  function handleChange(evento) {
    const { name, value } = evento.target;
    setBorrador((anterior) => ({ ...anterior, [name]: value }));
  }

  return (
    <div className="tarjeta-pendiente">
      <div className="tarjeta-pendiente__encabezado">
        <h3 className="tarjeta-pendiente__palabra">{coautoria.palabra}</h3>
        <span className="badge badge-abierto">{coautoria.tipo_gramatical}</span>
        <span className="tag-contexto">{coautoria.etiqueta}</span>
      </div>

      {/* Alterna entre modo lectura (texto plano) y modo edición
          (inputs/textareas), controlado por la prop enEdicion que
          maneja el componente padre (RevisionPalabras.jsx). */}
      {enEdicion ? (
        <>
          <div className="form-group">
            <label className="form-label" htmlFor={`sentido-${coautoria.id_coautoria}`}>Sentido / significado aportado</label>
            <textarea
              id={`sentido-${coautoria.id_coautoria}`}
              className="form-textarea"
              name="sentido"
              rows={2}
              value={borrador.sentido}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor={`cita-${coautoria.id_coautoria}`}>Cita textual</label>
            <textarea
              id={`cita-${coautoria.id_coautoria}`}
              className="form-textarea"
              name="texto_cita"
              rows={2}
              value={borrador.texto_cita}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor={`fuente-${coautoria.id_coautoria}`}>Fuente</label>
            <input
              id={`fuente-${coautoria.id_coautoria}`}
              className="form-input"
              name="fuente"
              value={borrador.fuente}
              onChange={handleChange}
            />
          </div>
        </>
      ) : (
        <>
          <p>{coautoria.sentido}</p>
          <div className="tarjeta-pendiente__cita">
            "{coautoria.texto_cita}"
            <span className="tarjeta-pendiente__cita-autor">— {coautoria.fuente}</span>
          </div>
        </>
      )}

      <p className="tarjeta-pendiente__meta">Aportado por <strong>{coautoria.estudiante}</strong></p>

      <div className="tarjeta-pendiente__acciones">
        {enEdicion ? (
          <>
            {/* Al aprobar desde modo edición, se envía el borrador
                completo (con las correcciones) hacia arriba. */}
            <button className="btn btn-primary" onClick={() => onAprobar(borrador)}>Guardar y aprobar</button>
            <button className="btn btn-secondary" onClick={onCancelarEdicion}>Cancelar</button>
          </>
        ) : (
          <>
            {/* Al aprobar desde modo lectura (sin editar nada), se
                envía igual el borrador -- que en este caso es
                idéntico a los datos originales de la coautoría. */}
            <button className="btn btn-primary" onClick={() => onAprobar(borrador)}>Aprobar</button>
            <button className="btn btn-secondary" onClick={onIniciarEdicion}>Editar</button>
            <button className="btn btn-rechazar" onClick={onRechazar}>Rechazar</button>
          </>
        )}
      </div>
    </div>
  );
}