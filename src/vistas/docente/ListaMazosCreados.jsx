import { useEffect, useState, useCallback } from 'react';

import { listarMazos } from '../../cliente-api/mazosApi';
import { MazoItem } from './crear-mazo/MazoItem';
import './crear-mazo/crear-mazo.css';
import './crear-mazo/mazos-creados.css';

// Ordena por semana (soporta números y textos como "2-3") y, a igual semana, por id.
function compararPorSemana(a, b) {
  return (
    String(a.semana).localeCompare(String(b.semana), 'es', { numeric: true }) ||
    a.id_mazo - b.id_mazo
  );
}

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

  const mazosOrdenados = [...mazos].sort(compararPorSemana);

  return (
    <section className="mazos-creados" aria-labelledby="mazos-creados-titulo">
      <header className="mazos-creados__encabezado">
        <h2 className="mazos-creados__titulo" id="mazos-creados-titulo">
          Mazos creados
        </h2>
        <p className="mazos-creados__subtitulo">Organizados por semana</p>
      </header>

      {mazosOrdenados.length === 0 ? (
        <p className="empty-state">Todavía no se han creado mazos.</p>
      ) : (
        <ul className="mazos-grid">
          {mazosOrdenados.map((mazo) => (
            <MazoItem
              key={mazo.id_mazo}
              mazo={mazo}
              onEstadoActualizado={actualizarMazoEnLista}
            />
          ))}
        </ul>
      )}
    </section>
  );
}