/**
 * @file ListaMazosCreados.jsx
 * @brief Lista de mazos creados por la docente (HU-001).
 */

import { MazosEstudio } from '../mazos-estudio/MazosEstudio';

/**
 * @brief Se conserva el nombre para no tocar PanelDocente: la lista del docente
 * es la vista compartida "Mazos de estudio" con rol docente.
 * @param {Object} props
 * @param {number} props.refrescarTrigger - Al cambiar este valor se recarga la lista.
 * @return {JSX.Element}
 */
export function ListaMazosCreados({ refrescarTrigger }) {
  return <MazosEstudio rol="docente" refrescarTrigger={refrescarTrigger} />;
}