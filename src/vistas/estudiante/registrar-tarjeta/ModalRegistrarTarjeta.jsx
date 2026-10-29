/**
 * @file ModalRegistrarTarjeta.jsx
 * @brief Modal para registrar una palabra nueva en un mazo (HU-002).
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RegistrarTarjetaForm } from './RegistrarTarjetaForm';
import './registrar-tarjeta.css';

/**
 * @brief Muestra RegistrarTarjetaForm en un modal que se cierra con Escape o con clic fuera.
 * @param {Object} props
 * @param {Function} props.onCerrar - Cierra el modal.
 * @return {JSX.Element}
 */
export function ModalRegistrarTarjeta({ onCerrar }) {
  const { t } = useTranslation();

  useEffect(() => {
    function handleEscape(evento) {
      if (evento.key === 'Escape') {
        onCerrar();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onCerrar]);

  /**
   * @brief Cierra el modal si el clic fue en el fondo oscuro y no dentro de la tarjeta.
   * @param {MouseEvent} evento - Evento de clic.
   */
  function handleClicFondo(evento) {
    if (evento.target === evento.currentTarget) {
      onCerrar();
    }
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t('registerWordModal.ariaLabel')}
      onClick={handleClicFondo}
    >
      <div className="modal-card">
        <RegistrarTarjetaForm onCerrar={onCerrar} />
      </div>
    </div>
  );
}