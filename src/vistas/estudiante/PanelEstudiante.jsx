import { useState } from 'react';
import { ModalRegistrarTarjeta } from './registrar-tarjeta/ModalRegistrarTarjeta';

export function PanelEstudiante() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  return (
    <div className="panel-estudiante">
      <div className="panel-estudiante__header">
        <div>
          <h1>Mis aportes</h1>
          <p>Registra nuevas palabras en los mazos disponibles.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setMostrarFormulario(true)}
        >
          Registrar palabra
        </button>
      </div>

      {mostrarFormulario && (
        <ModalRegistrarTarjeta
          onCerrar={() => setMostrarFormulario(false)}
        />
      )}
    </div>
  );
}