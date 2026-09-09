import { useState } from 'react';

import { CrearMazoForm } from './crear-mazo/CrearMazoForm';
import { ListaMazosCreados } from './ListaMazosCreados';

export function PanelDocente() {
  const [refrescarTrigger, setRefrescarTrigger] = useState(0);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);

  function manejarMazoCreado() {
    setRefrescarTrigger((valor) => valor + 1);
    setMostrarFormulario(false);
  }

  return (
    <div className="panel-docente">
      <ListaMazosCreados refrescarTrigger={refrescarTrigger} />

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setMostrarFormulario(true)}
      >
        Crear nuevo mazo
      </button>

      {mostrarFormulario && (
        <div className="modal-overlay">
          <CrearMazoForm
            onMazoCreado={manejarMazoCreado}
            onCerrar={() => setMostrarFormulario(false)}
          />
        </div>
      )}
    </div>
  );
}