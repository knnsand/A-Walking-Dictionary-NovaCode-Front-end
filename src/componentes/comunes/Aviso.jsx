export function Aviso({ tipo, mensaje }) {
  if (!mensaje) return null;

  const estilos = {
    exito: { background: '#e6f4ea', color: '#1e4620', border: '1px solid #1e4620' },
    error: { background: '#fdecea', color: '#611a15', border: '1px solid #611a15' },
  };

  return (
    <div role="alert" style={{ padding: '0.5rem 1rem', borderRadius: '4px', margin: '0.5rem 0', ...estilos[tipo] }}>
      {mensaje}
    </div>
  );
}