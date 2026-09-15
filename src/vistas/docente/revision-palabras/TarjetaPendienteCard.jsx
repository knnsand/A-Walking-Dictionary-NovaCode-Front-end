import { useState } from 'react';

/**
 * Tarjeta individual de la pestaña "Nuevos Términos" (HU-004).
 * Muestra una palabra recién aportada por un estudiante, pendiente
 * de validación por parte de la docente.
 *
 * Solo tiene dos acciones: Aprobar y Editar. Se decidió no incluir
 * "Rechazar" en esta tarjeta porque no hay un criterio claro de
 * cuándo una palabra nueva está "tan mal" que deba descartarse por
 * completo -- si tiene errores de traducción, redacción u
 * ortografía, se corrigen en modo edición antes de aprobar, en vez
 * de perder el aporte del estudiante.
 *
 * (Comparar con CoautoriaPendienteCard.jsx, que sí tiene Rechazar,
 * porque ahí el criterio de rechazo es explícito: la coautoría no
 * concuerda con la palabra.)
 *
 * IMPORTANTE (nota de integración con HU-005): al presionar
 * "Aprobar" aquí, la tarjeta NO se aprueba de inmediato. El
 * componente padre (RevisionPalabras.jsx) recibe los datos vía
 * onAprobar() y abre EtiquetaContextoModal, donde la docente debe
 * asignar registro y variante regional antes de que la aprobación
 * se confirme. Por eso este componente no sabe nada de "contexto
 * lingüístico" -- esa responsabilidad vive en el padre.
 */
export function TarjetaPendienteCard({
  tarjeta,
  enEdicion,
  onIniciarEdicion,
  onCancelarEdicion,
  onAprobar
}) {
  // Estado local editable para cada campo, inicializado con los
  // valores originales de la tarjeta (o cadena vacía si vinieran
  // undefined). Son 3 useState separados (en vez de un solo objeto
  // "borrador" como en CoautoriaPendienteCard) -- funcionalmente
  // equivalente, solo un estilo distinto de manejar el mismo problema.
  const [traduccion, setTraduccion] = useState(tarjeta.traduccion || '');
  const [definicion, setDefinicion] = useState(tarjeta.definicion || '');
  const [ejemplo, setEjemplo] = useState(tarjeta.ejemplo || '');

  /**
   * Se dispara al enviar el formulario de edición (botón "Guardar
   * y Aprobar", type="submit"). Evita el comportamiento por defecto
   * del <form> (que recargaría la página) y envía los 3 campos
   * editados al padre para que continúe el flujo de aprobación
   * (que, como se explica arriba, en realidad abre el modal de
   * contexto de HU-005 antes de aprobar de verdad).
   */
  function handleGuardarAprobar(e) {
    e.preventDefault();
    onAprobar({ traduccion, definicion, ejemplo });
  }

  return (
    <div className="tarjeta-pendiente">
      <div className="tarjeta-pendiente__encabezado">
        <span className="badge badge-abierto">Pendiente</span>
        <h3 className="tarjeta-pendiente__palabra">{tarjeta.palabra}</h3>
      </div>

      <div className="tarjeta-pendiente__meta">
        Sometido por: <strong>{tarjeta.estudiante}</strong>
      </div>

      {/* Modo lectura: solo texto, sin inputs. Se muestra cuando
          enEdicion es false (valor controlado por RevisionPalabras.jsx,
          que decide qué tarjeta está en edición según idEnEdicion). */}
      {!enEdicion ? (
        <>
          <div>
            <p className="tarjeta-pendiente__meta">
              <strong>Traducción:</strong> {tarjeta.traduccion}
            </p>
            <p className="tarjeta-pendiente__meta">
              <strong>Definición:</strong> {tarjeta.definicion}
            </p>
          </div>

          {/* El ejemplo de uso es opcional (HU-002: "campo opcional
              limitado a 150 caracteres"), por eso se renderiza
              condicionalmente en vez de siempre mostrar la cita. */}
          {tarjeta.ejemplo && (
            <blockquote className="tarjeta-pendiente__cita">
              "{tarjeta.ejemplo}"
            </blockquote>
          )}

          <div className="tarjeta-pendiente__acciones">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onIniciarEdicion}
            >
              Editar
            </button>
            {/* Aprobar sin pasar por edición: se envía un objeto
                vacío porque no hay correcciones que aplicar; el
                padre interpreta esto como "aprobar tal cual está". */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onAprobar({})}
            >
              Aprobar
            </button>
          </div>
        </>
      ) : (
        /* Modo edición: formulario real con <form onSubmit>, lo que
           permite enviar con Enter además del clic en el botón, y
           habilita la validación nativa del navegador (`required`). */
        <form onSubmit={handleGuardarAprobar}>
          <div className="form-group">
            <label className="form-label" htmlFor={`traduccion-${tarjeta.id_tarjeta}`}>
              Traducción
            </label>
            <input
              id={`traduccion-${tarjeta.id_tarjeta}`}
              type="text"
              className="form-input"
              value={traduccion}
              onChange={(e) => setTraduccion(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor={`definicion-${tarjeta.id_tarjeta}`}>
              Definición
            </label>
            <textarea
              id={`definicion-${tarjeta.id_tarjeta}`}
              className="form-textarea"
              rows={3}
              value={definicion}
              onChange={(e) => setDefinicion(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor={`ejemplo-${tarjeta.id_tarjeta}`}>
              Ejemplo de uso
            </label>
            {/* Sin `required`: el ejemplo sigue siendo opcional
                también en modo edición, consistente con HU-002. */}
            <input
              id={`ejemplo-${tarjeta.id_tarjeta}`}
              type="text"
              className="form-input"
              value={ejemplo}
              onChange={(e) => setEjemplo(e.target.value)}
            />
          </div>

          <div className="tarjeta-pendiente__acciones">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelarEdicion}
            >
              Cancelar
            </button>
            {/* type="submit": dispara handleGuardarAprobar() vía el
                onSubmit del <form>, no un onClick directo. */}
            <button
              type="submit"
              className="btn btn-primary"
            >
              Guardar y Aprobar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}