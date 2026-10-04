import { useState } from 'react';
import { ModalRegistrarTarjeta } from './registrar-tarjeta/ModalRegistrarTarjeta';
import { ModalUnirseCurso } from './unirse-curso/ModalUnirseCurso';
import { useEncabezadoPagina } from '../../contexto/useEncabezadoPagina';

export function PanelEstudiante() {
  const [mostrarFormularioTarjeta, setMostrarFormularioTarjeta] = useState(false);
  const [mostrarFormularioUnirse, setMostrarFormularioUnirse] = useState(false);

  // El título de la página lo pinta el layout (barra superior).
  useEncabezadoPagina('Mis aportes', 'Registra nuevas palabras en los mazos disponibles.');

  return (
    <div className="panel-estudiante">
      <div className="panel-estudiante__acciones">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setMostrarFormularioTarjeta(true)}
        >
          Registrar palabra
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setMostrarFormularioUnirse(true)}
        >
          Unirme a un curso
        </button>
      </div>

      {mostrarFormularioTarjeta && (
        <ModalRegistrarTarjeta onCerrar={() => setMostrarFormularioTarjeta(false)} />
      )}

      {mostrarFormularioUnirse && (
        <ModalUnirseCurso onCerrar={() => setMostrarFormularioUnirse(false)} />
      )}
    </div>
  );
}
