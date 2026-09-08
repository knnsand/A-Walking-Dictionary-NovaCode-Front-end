import { useEffect, useState, useCallback } from 'react';
import { listarMazos } from '../../cliente-api/mazosApi';

export function ListaMazosCreados({ refrescarTrigger }) {
  const [mazos, setMazos] = useState([]);

  const cargarMazos = useCallback(() => {
    listarMazos().then(setMazos);
  }, []);

  useEffect(() => {
    cargarMazos();
  }, [cargarMazos, refrescarTrigger]);

  return (
    <div className="card-mazo">
      <div className="card-mazo__header">
        <div className="card-mazo__icon" aria-hidden="true" />
        <div>
          <h2 className="card-mazo__title">Mazos creados</h2>
          <p className="card-mazo__subtitle">Mazos registrados en esta sesión</p>
        </div>
      </div>

      <div className="card-mazo__body card-mazo__body--flush">
        {mazos.length === 0 ? (
          <p className="empty-state">Todavía no se han creado mazos.</p>
        ) : (
          <ul className="mazo-list">
            {mazos.map((mazo) => (
              <li className="mazo-list__item" key={mazo.id_mazo}>
                <div className="mazo-list__info">
                  <strong>{mazo.nombre_lectura}</strong>
                  <span className="mazo-list__meta">
                    {mazo.autor} · Semana {mazo.semana} · {mazo.variante_regional_predeterminada}
                  </span>
                </div>
                <span className={`badge ${mazo.estado === 'abierto' ? 'badge-abierto' : 'badge-cerrado'}`}>
                  {mazo.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}