export function MazoItem({ mazo }) {
  return (
    <li className="mazo-list__item">
      <div className="mazo-list__info">
        <strong>{mazo.nombre_lectura}</strong>

        <span className="mazo-list__meta">
          {mazo.autor} · Semana {mazo.semana} · {mazo.variante_regional_predeterminada}
        </span>
      </div>

      <span
        className={`badge ${
          mazo.estado === 'abierto' ? 'badge-abierto' : 'badge-cerrado'
        }`}
      >
        {mazo.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
      </span>
    </li>
  );
}