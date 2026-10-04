import { useEffect, useState, useCallback } from 'react';

import { listarMazos } from '../../cliente-api/mazosApi';
import { MazoItem } from './crear-mazo/MazoItem';
import './crear-mazo/crear-mazo.css';
import { useEncabezadoPagina } from '../../contexto/useEncabezadoPagina';
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

  // El título de la página lo pinta el layout (barra superior).
  useEncabezadoPagina('Mazos creados', 'Organizados por semana');

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
    <section className="mazos-creados">
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
