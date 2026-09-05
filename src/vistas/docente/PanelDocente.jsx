import { useState } from 'react';
import { CrearMazoForm } from './CrearMazoForm';
import { ListaMazosCreados } from './ListaMazosCreados';

export function PanelDocente() {
  const [refrescarTrigger, setRefrescarTrigger] = useState(0);

  return (
    <div>
      <CrearMazoForm onMazoCreado={() => setRefrescarTrigger((valor) => valor + 1)} />
      <hr />
      <h2>Mazos creados</h2>
      <ListaMazosCreados refrescarTrigger={refrescarTrigger} />
    </div>
  );
}