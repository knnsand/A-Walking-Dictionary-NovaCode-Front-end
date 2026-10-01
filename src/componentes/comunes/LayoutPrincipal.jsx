import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexto/useAuth';
import { ModalCrearMazo } from '../../vistas/docente/ModalCrearMazo';
import { ModalRegistrarTarjeta } from '../../vistas/estudiante/registrar-tarjeta/ModalRegistrarTarjeta';

/**
 * Envoltorio de página usado por las 3 vistas de rol. Coloca el
 * Sidebar (adaptado al rol activo vía useAuth) más una barra
 * superior con el botón del menú (solo en móvil), y renderiza la ruta hija en <Outlet/>. *
 * También es dueño del estado del modal "Crear Mazo de Estudio"
 * (HU-001) y del modal "Registrar palabra" (HU-002), para que puedan
 * abrirse desde el botón del Sidebar sin importar en qué página esté
 * parado el usuario.
 *
 * HU-012: pasa `perfilCompleto` al Sidebar para que deshabilite sus
 * opciones mientras el estudiante recién registrado no haya completado
 * su perfil académico (HU-013) y sus datos personales.
 */
export function LayoutPrincipal({ contadores = {} }) {
  const { rol, usuario, perfilCompleto } = useAuth();
  const navigate = useNavigate();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [modalCrearMazoAbierto, setModalCrearMazoAbierto] = useState(false);
  const [modalRegistrarTarjetaAbierto, setModalRegistrarTarjetaAbierto] = useState(false);

  return (
    <div className={`app-shell app-shell--${rol}`}>
      <Sidebar
        rol={rol}
        nombreUsuario={usuario?.nombre_completo}
        correoUsuario={usuario?.email}
        contadores={contadores}
        perfilCompleto={perfilCompleto}
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
        onAbrirCrearMazo={() => setModalCrearMazoAbierto(true)}
        onAbrirRegistrarTarjeta={() => setModalRegistrarTarjetaAbierto(true)}
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

      {rol === 'estudiante' && modalRegistrarTarjetaAbierto && (
        <ModalRegistrarTarjeta onCerrar={() => setModalRegistrarTarjetaAbierto(false)} />
      )}
    </div>
  );
}