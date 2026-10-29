/**
 * @file EncabezadoProvider.jsx
 * @brief Proveedor del encabezado (título y subtítulo) de la pantalla activa.
 */

import { useMemo, useState } from 'react';
import { EncabezadoContext } from './EncabezadoContext';

/**
 * @brief Lo usan los layouts (LayoutPrincipal y LayoutInvitado) para guardar el
 * título de la pantalla activa y mostrarlo en la barra superior.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del layout.
 * @return {JSX.Element}
 */
export function EncabezadoProvider({ children }) {
  const [encabezado, setEncabezado] = useState(null);

  const valor = useMemo(() => ({ encabezado, setEncabezado }), [encabezado]);

  return <EncabezadoContext.Provider value={valor}>{children}</EncabezadoContext.Provider>;
}
