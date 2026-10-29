/**
 * @file ModalCrearMazo.jsx
 * @brief Modal para crear un mazo de estudio (HU-001).
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CrearMazoForm } from "./crear-mazo/CrearMazoForm";
/**
 * @brief Envoltorio de modal para CrearMazoForm (HU-001). No modifica la
 * lógica interna del formulario -- solo lo presenta flotando sobre
 * la pantalla actual, replicando el patrón visual del Mockup 4.
 *
 * Se cierra: al hacer clic fuera de la tarjeta, con la tecla Escape,
 * o automáticamente cuando el formulario crea el mazo con éxito
 * (ver handleMazoCreado).
 * @param {Object} props
 * @param {Function} props.onCerrar - Cierra el modal.
 * @param {Function} [props.onMazoCreado] - Recibe el mazo recién creado.
 * @return {JSX.Element}
 */
export function ModalCrearMazo({ onCerrar, onMazoCreado }) {
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

  /**
   * @brief Avisa que se creó el mazo y cierra el modal.
   * @param {Object} mazoCreado - Mazo devuelto por el backend.
   */
  function handleMazoCreado(mazoCreado) {
    onMazoCreado?.(mazoCreado);
    onCerrar();
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t('createDeckModal.ariaLabel')}
      onClick={handleClicFondo}
    >
      <div className="modal-card">
        <CrearMazoForm
          onMazoCreado={handleMazoCreado}
          onCerrar={onCerrar}
        />
      </div>
    </div>
  );
}