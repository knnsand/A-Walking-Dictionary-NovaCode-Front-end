import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { InscribirEstudianteForm } from './InscribirEstudianteForm';

export function ModalInscribirEstudiante({ onCerrar, onInscripcionCreada }) {
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
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t('enrollStudentModal.ariaLabel')} onClick={handleClicFondo}>
      <div className="modal-card">
        <InscribirEstudianteForm onCerrar={onCerrar} onInscripcionCreada={onInscripcionCreada} />
      </div>
    </div>
  );
}