export function Aviso({ tipo, mensaje }) {
  if (!mensaje) return null;

  const clases = {
    exito: { background: 'var(--color-success-bg)', color: 'var(--color-success-text)', border: '1px solid var(--color-success-border)' },
    error: { background: 'var(--color-error-bg)', color: 'var(--color-error-text)', border: '1px solid var(--color-error-border)' },
  };

  return (
    <div role="alert" style={{ padding: '10px 14px', borderRadius: '4px', marginBottom: '12px', ...clases[tipo] }}>
      {mensaje}
    </div>
  );
}