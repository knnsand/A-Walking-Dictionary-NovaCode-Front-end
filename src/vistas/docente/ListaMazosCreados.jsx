import { MazosEstudio } from '../mazos-estudio/MazosEstudio';

// Se conserva el nombre para no tocar PanelDocente: la lista del docente
// es la vista compartida "Mazos de estudio" con rol docente.
export function ListaMazosCreados({ refrescarTrigger }) {
  return <MazosEstudio rol="docente" refrescarTrigger={refrescarTrigger} />;
}