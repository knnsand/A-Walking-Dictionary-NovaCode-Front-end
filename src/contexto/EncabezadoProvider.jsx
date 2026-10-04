import { useMemo, useState } from 'react';
import { EncabezadoContext } from './EncabezadoContext';

/**
 * Lo usan los layouts (LayoutPrincipal y LayoutInvitado) para guardar el
 * título de la pantalla activa y mostrarlo en la barra superior.
 */
export function EncabezadoProvider({ children }) {
  const [encabezado, setEncabezado] = useState(null);

  const valor = useMemo(() => ({ encabezado, setEncabezado }), [encabezado]);

  return <EncabezadoContext.Provider value={valor}>{children}</EncabezadoContext.Provider>;
}
