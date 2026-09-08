import { useState } from 'react';
import { CrearMazoForm } from './CrearMazoForm';
import { ListaMazosCreados } from './ListaMazosCreados';

export function PanelDocente() {
  const [refrescarTrigger, setRefrescarTrigger] = useState(0);

  return (
    <div>
      <CrearMazoForm onMazoCreado={() => setRefrescarTrigger((valor) => valor + 1)} />
      <ListaMazosCreados refrescarTrigger={refrescarTrigger} />
    </div>
  );
}