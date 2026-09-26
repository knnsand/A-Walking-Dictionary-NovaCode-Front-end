import { sinAportesCriterio } from './participacionMazo.constants';

/**
 * Fila de la tabla de participación. Recibe una fila con la forma exacta de la
 * respuesta del backend (ver doc/CONTRATO_FRONTEND_HU-2.3.md).
 */
export function FilaEstudianteParticipacion({ fila }) {
  const sinAportes = sinAportesCriterio(fila);

  return (
    <tr>
      <td>
        <div className="participacion-mazo__estudiante">
          <span className="participacion-mazo__avatar">
            {fila.nombre_completo
              .split(' ')
              .slice(0, 2)
              .map((p) => p[0])
              .join('')
              .toUpperCase()}
          </span>
          <div>
            <strong>{fila.nombre_completo}</strong>
            <span className="participacion-mazo__id">ID {fila.estudiante_id}</span>
          </div>
        </div>
      </td>
      <td className="participacion-mazo__num">{fila.palabras_aportadas}</td>
      <td className="participacion-mazo__num">{fila.coautorias}</td>
      <td className="participacion-mazo__num">{fila.tarjetas_pendientes}</td>
      <td className="participacion-mazo__num">{fila.tarjetas_aprobadas}</td>
      <td>
        <span className={`participacion-mazo__badge ${sinAportes ? 'is-alerta' : 'is-ok'}`}>
          {sinAportes ? 'Sin aportes' : 'Participando'}
        </span>
      </td>
    </tr>
  );
}
