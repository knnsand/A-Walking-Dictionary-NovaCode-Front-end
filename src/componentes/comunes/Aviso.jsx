/**
 * @file Aviso.jsx
 * @brief Mensaje de aviso (éxito, error, etc.) que se muestra en los formularios.
 */

/**
 * @brief Muestra un mensaje con el estilo del tipo indicado; no renderiza nada si no hay mensaje.
 * @param {Object} props
 * @param {string} props.tipo - Tipo de aviso; define la clase CSS `aviso--{tipo}`.
 * @param {string} [props.mensaje] - Texto a mostrar.
 * @return {JSX.Element|null}
 */
export function Aviso({ tipo, mensaje }) {
  if (!mensaje) return null;

  return (
    <div className={`aviso aviso--${tipo}`} role="alert">
      {mensaje}
    </div>
  );
}