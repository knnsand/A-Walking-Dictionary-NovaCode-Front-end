import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UnirseCursoForm } from './UnirseCursoForm';

export function ModalUnirseCurso({ onCerrar, onInscripcionCreada }) {
  const { t } = useTranslation();

  useEffect(() => {
    function handleEscape(evento) {
      if (evento.key === 'Escape') onCerrar();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCerrar]);

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