import { useState } from 'react';
import { ModalRegistrarTarjeta } from './registrar-tarjeta/ModalRegistrarTarjeta';
import { ModalUnirseCurso } from './unirse-curso/ModalUnirseCurso';

export function PanelEstudiante() {
  const [mostrarFormularioTarjeta, setMostrarFormularioTarjeta] = useState(false);
  const [mostrarFormularioUnirse, setMostrarFormularioUnirse] = useState(false);

  return (
    <div className="panel-estudiante">
      <div className="panel-estudiante__header">
        <div>
          <h1>Mis aportes</h1>
          <p>Registra nuevas palabras en los mazos disponibles.</p>
        </div>

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