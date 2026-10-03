import { useLocation } from 'react-router-dom';
import { ListaMazosCreados } from './ListaMazosCreados';

export function PanelDocente() {
  const location = useLocation();

  // El modal de "Crear Mazo de Estudio" vive en LayoutPrincipal (botón del sidebar).
  // Al crear un mazo, LayoutPrincipal navega aquí con una marca nueva en el estado
  // de la ruta, y eso recarga la lista aunque ya estemos en esta pantalla.
  const refrescarTrigger = location.state?.refrescar ?? 0;

  return (
    <div className="panel-docente">
      <ListaMazosCreados refrescarTrigger={refrescarTrigger} />
    </div>
  );
}