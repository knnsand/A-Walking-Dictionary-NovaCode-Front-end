export function Aviso({ tipo, mensaje }) {
  if (!mensaje) return null;

  return (
    <div className={`aviso aviso--${tipo}`} role="alert">
      {mensaje}
    </div>
  );
}