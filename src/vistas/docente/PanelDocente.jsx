import { useState } from 'react';
import { ModalCrearMazo } from './ModalCrearMazo';
import { ListaMazosCreados } from './ListaMazosCreados';

export function PanelDocente() {
  const [refrescarTrigger, setRefrescarTrigger] = useState(0);
  const [mostrarFormularioMazo, setMostrarFormularioMazo] = useState(true);

  function manejarMazoCreado() {
    setRefrescarTrigger((valor) => valor + 1);
    setMostrarFormularioMazo(false);
  }

  return (
    <div className="panel-docente">
      <ListaMazosCreados refrescarTrigger={refrescarTrigger} />

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setMostrarFormularioMazo(true)}
      >
        Crear nuevo mazo
      </button>

      {mostrarFormularioMazo && (
        <ModalCrearMazo onMazoCreado={manejarMazoCreado} onCerrar={() => setMostrarFormularioMazo(false)} />
      )}

      
    </div>
  );
}