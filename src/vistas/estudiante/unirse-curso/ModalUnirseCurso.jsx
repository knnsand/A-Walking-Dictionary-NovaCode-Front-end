/**
 * @file ModalUnirseCurso.jsx
 * @brief Modal para que el estudiante se una a un curso con código de acceso (HU-5.3.1).
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UnirseCursoForm } from './UnirseCursoForm';

/**
 * @brief Muestra UnirseCursoForm en un modal que se cierra con Escape o con clic fuera.
 * @param {Object} props
 * @param {Function} props.onCerrar - Cierra el modal.
 * @param {Function} [props.onInscripcionCreada] - Recibe la inscripción creada.
 * @return {JSX.Element}
 */
export function ModalUnirseCurso({ onCerrar, onInscripcionCreada }) {
  const { t } = useTranslation();

  useEffect(() => {
    function handleEscape(evento) {
      if (evento.key === 'Escape') onCerrar();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCerrar]);

  /**
   * @brief Cierra el modal si el clic fue en el fondo oscuro y no dentro de la tarjeta.
   * @param {MouseEvent} evento - Evento de clic.
   */
  function handleClicFondo(evento) {
    if (evento.target === evento.currentTarget) onCerrar();
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t('joinCourseModal.ariaLabel')} onClick={handleClicFondo}>
      <div className="modal-card">
        <UnirseCursoForm onCerrar={onCerrar} onInscripcionCreada={onInscripcionCreada} />
      </div>
    </div>
  );
}