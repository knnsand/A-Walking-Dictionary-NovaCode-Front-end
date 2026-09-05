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

  if (mazos.length === 0) {
    return <p>Todavía no se han creado mazos.</p>;
  }

  return (
    <ul>
      {mazos.map((mazo) => (
        <li key={mazo.id_mazo}>
          <strong>{mazo.nombre_lectura}</strong> — {mazo.autor} (Semana {mazo.semana}, {mazo.variante_regional_predeterminada}, {mazo.estado})
        </li>
      ))}
    </ul>
  );
}