import { useEffect, useState, useCallback } from 'react';

import { listarMazos } from '../../cliente-api/mazosApi';
import { MazoItem } from '../docente/crear-mazo/MazoItem';
import '../docente/crear-mazo/crear-mazo.css';
import '../docente/crear-mazo/mazos-creados.css';
import { useEncabezadoPagina } from '../../contexto/useEncabezadoPagina';

// Ordena por semana (soporta números y textos como "2-3") y, a igual semana, por id.
function compararPorSemana(a, b) {
  return (
    String(a.semana).localeCompare(String(b.semana), 'es', { numeric: true }) ||
    a.id_mazo - b.id_mazo
  );
}

const MENSAJE_VACIO = {
  docente: 'Todavía no se han creado mazos.',
  estudiante: 'Aún no tienes mazos disponibles. Únete a un curso para verlos.',
  invitado: 'Todavía no hay mazos disponibles.',
};

/**
 * Vista "Mazos de estudio", compartida por los tres roles.
 * Todos ven nombre, autor, variante regional, semana y estado del mazo;
 * las acciones de cada tarjeta dependen del rol (ver MazoItem).
 *
 * Props:
 * - rol: 'docente' | 'estudiante' | 'invitado'
 * - refrescarTrigger: valor que, al cambiar, recarga la lista (lo usa el docente
 *   tras crear un mazo).
 */
export function MazosEstudio({ rol, refrescarTrigger }) {
  const [mazos, setMazos] = useState([]);
  const [error, setError] = useState(null);

  // El título de la página lo pinta el layout (barra superior).
  useEncabezadoPagina('Mazos de estudio', 'Organizados por semana');

  const cargarMazos = useCallback(() => {
    setError(null);
    listarMazos()
      .then(setMazos)
      .catch((e) => {
        console.error(e);
        setError('No se pudieron cargar los mazos.');
      });
  }, []);

  useEffect(() => {
    cargarMazos();
  }, [cargarMazos, refrescarTrigger]);

  function actualizarMazoEnLista(mazoActualizado) {
    setMazos((anteriores) =>
      anteriores.map((mazo) =>
        mazo.id_mazo === mazoActualizado.id_mazo ? mazoActualizado : mazo
      )
    );
  }

  const mazosOrdenados = [...mazos].sort(compararPorSemana);

  return (
    <section className="mazos-creados">
      {error && (
        <p className="mazo-card__error" role="alert">
          {error}
        </p>
      )}

      {mazosOrdenados.length === 0 && !error ? (
        <p className="empty-state">{MENSAJE_VACIO[rol] ?? MENSAJE_VACIO.invitado}</p>
      ) : (
        <ul className="mazos-grid">
          {mazosOrdenados.map((mazo) => (
            <MazoItem
              key={mazo.id_mazo}
              mazo={mazo}
              rol={rol}
              onEstadoActualizado={actualizarMazoEnLista}
            />
          ))}
        </ul>
      )}
    </section>
  );
}