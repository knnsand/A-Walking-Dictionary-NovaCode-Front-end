import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexto/useAuth';
import { ModalCrearMazo } from '../../vistas/docente/ModalCrearMazo';

/**
 * Envoltorio de página usado por las 3 vistas de rol. Coloca el
 * Sidebar (adaptado al rol activo vía useAuth) más una barra
 * superior con buscador, y renderiza la ruta hija en <Outlet/>.
 *
 * También es dueño del estado del modal "Crear Mazo de Estudio"
 * (HU-001), para que pueda abrirse desde el botón del Sidebar sin
 * importar en qué página esté parado el docente.
 */
export function LayoutPrincipal({ contadores = {} }) {
  const { rol, usuario } = useAuth();
  const navigate = useNavigate();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [modalCrearMazoAbierto, setModalCrearMazoAbierto] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        rol={rol}
        nombreUsuario={usuario?.nombre_completo}
        correoUsuario={usuario?.email}
        contadores={contadores}
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
        onAbrirCrearMazo={() => setModalCrearMazoAbierto(true)}
      />

      <div className="app-shell__contenido">
        <div className="topbar">
          <button
            className="topbar__menu-btn"
            type="button"
            aria-label="Abrir menú"
            onClick={() => setSidebarAbierto((valor) => !valor)}
          >
            ☰
          </button>
          <input className="topbar__buscador" type="search" placeholder="Buscar término, fonética, cita o autor..." />
        </div>

        <div className="pagina">
          <Outlet />
        </div>
      </div>

      {modalCrearMazoAbierto && (
        <ModalCrearMazo
          onCerrar={() => setModalCrearMazoAbierto(false)}
          onMazoCreado={() => {
            // Al crear el mazo desde cualquier pantalla, lleva al
            // docente a su panel para que vea el mazo recién creado
            // en ListaMazosCreados.
            navigate('/docente');
          }}
        />
      )}
    </div>
  );
}