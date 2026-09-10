import { useEffect } from 'react';
import { CrearMazoForm } from "./crear-mazo/CrearMazoForm";
/**
 * Envoltorio de modal para CrearMazoForm (HU-001). No modifica la
 * lógica interna del formulario -- solo lo presenta flotando sobre
 * la pantalla actual, replicando el patrón visual del Mockup 4.
 *
 * Se cierra: al hacer clic fuera de la tarjeta, con la tecla Escape,
 * o automáticamente cuando el formulario crea el mazo con éxito
 * (ver handleMazoCreado).
 */
export function ModalCrearMazo({ onCerrar, onMazoCreado }) {
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

  function handleMazoCreado(mazoCreado) {
    onMazoCreado?.(mazoCreado);
    onCerrar();
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Crear nuevo mazo de estudio"
      onClick={handleClicFondo}
    >
      <div className="modal-card">
        <CrearMazoForm onMazoCreado={handleMazoCreado} />
      </div>
    </div>
  );
}