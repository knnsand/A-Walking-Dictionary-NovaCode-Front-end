// vistas/estudiante/estudiar-tarjetas/PaginaEstudio.jsx
// Ruta /estudiante/estudio ("Modo Estudio" del Sidebar). HU-010.
//
// Envoltorio de la vista: aporta la navegación (react-router) y la inscripción del estudiante,
// para que EstudiarTarjetas siga siendo una vista reutilizable y fácil de probar.

import { useNavigate } from 'react-router-dom';
import { EstudiarTarjetas } from './EstudiarTarjetas';
import { INSCRIPCION_ID_TEMPORAL } from './estudiarTarjetas.constants';

export function PaginaEstudio() {
  const navigate = useNavigate();

  return (
    <EstudiarTarjetas
      inscripcionId={INSCRIPCION_ID_TEMPORAL}
      onSalir={() => navigate('/estudiante')}
    />
  );
}
