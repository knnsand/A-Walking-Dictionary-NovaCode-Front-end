/**
 * @file PaginaEstudio.jsx
 * @brief Ruta /estudiante/estudio ("Modo Estudio" del Sidebar). HU-010.
 *
 * Envoltorio de la vista: aporta la navegación (react-router) y la inscripción del estudiante,
 * para que EstudiarTarjetas siga siendo una vista reutilizable y fácil de probar.
 */

import { useNavigate } from 'react-router-dom';
import { EstudiarTarjetas } from './EstudiarTarjetas';
import { useAuth } from '../../../contexto/useAuth';

/**
 * @brief Monta EstudiarTarjetas con la inscripción del estudiante cuando ya se conoce.
 * @return {JSX.Element|null}
 */
export function PaginaEstudio() {
  const navigate = useNavigate();
  const { inscripcionId, inscripcionCargando } = useAuth();

  // Mientras se consulta la inscripción no se monta la vista, para no mostrar el
  // error de "sin inscripción" antes de tiempo.
  if (inscripcionCargando) return null;

  return (
    <EstudiarTarjetas
      inscripcionId={inscripcionId}
      onSalir={() => navigate('/estudiante')}
    />
  );
}
