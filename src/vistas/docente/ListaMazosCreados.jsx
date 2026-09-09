import { useEffect, useState, useCallback } from 'react';

import { listarMazos } from '../../cliente-api/mazosApi';
import { MazoItem } from './crear-mazo/MazoItem';
import './crear-mazo/crear-mazo.css';

export function ListaMazosCreados({ refrescarTrigger }) {
  const [mazos, setMazos] = useState([]);

  const cargarMazos = useCallback(() => {
    listarMazos().then(setMazos);
  }, []);

  useEffect(() => {
    cargarMazos();
  }, [cargarMazos, refrescarTrigger]);

  function actualizarMazoEnLista(mazoActualizado) {
    setMazos((anteriores) =>
      anteriores.map((mazo) =>
        mazo.id_mazo === mazoActualizado.id_mazo
          ? mazoActualizado
          : mazo
      )
    );
  }

  return (
    <div className="card-mazo">
      <div className="card-mazo__header">
        <div className="card-mazo__icon" aria-hidden="true" />

        <div>
          <h2 className="card-mazo__title">Mazos creados</h2>
          <p className="card-mazo__subtitle">
            Mazos registrados en esta sesión
          </p>
        </div>
      </div>

      <div className="card-mazo__body card-mazo__body--flush">
        {mazos.length === 0 ? (
          <p className="empty-state">
            Todavía no se han creado mazos.
          </p>
        ) : (
          <ul className="mazo-list">
            {mazos.map((mazo) => (
              <MazoItem
                key={mazo.id_mazo}
                mazo={mazo}
                onEstadoActualizado={actualizarMazoEnLista}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}