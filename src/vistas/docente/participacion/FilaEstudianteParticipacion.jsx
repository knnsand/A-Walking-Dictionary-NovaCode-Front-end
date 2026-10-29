/**
 * @file FilaEstudianteParticipacion.jsx
 * @brief Fila de la tabla de participación por mazo (HU-2.3).
 */

import { useTranslation } from 'react-i18next';
import { sinAportesCriterio } from './participacionMazo.constants';

/**
 * @brief Fila de la tabla de participación. Recibe una fila con la forma exacta de la
 * respuesta del backend (ver doc/CONTRATO_FRONTEND_HU-2.3.md).
 * @param {Object} props
 * @param {Object} props.fila - Participación de un estudiante en el mazo.
 * @return {JSX.Element}
 */
export function FilaEstudianteParticipacion({ fila }) {
  const { t } = useTranslation();
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
          {sinAportes ? t('participationRow.noContributions') : t('participationRow.participating')}
        </span>
      </td>
    </tr>
  );
}