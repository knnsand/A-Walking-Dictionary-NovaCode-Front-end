import { NavLink, Link, Outlet } from 'react-router-dom';
import './LayoutInvitado.css';

export function LayoutInvitado() {
  return (
    <div className="layout-invitado">
      <aside className="layout-invitado__sidebar">
        <div className="layout-invitado__marca">
          <div className="layout-invitado__logo">
            📖
          </div>

          <div className="layout-invitado__marca-texto">
            <p className="layout-invitado__marca-titulo">
              Anglophone Literature
            </p>

            <p className="layout-invitado__marca-subtitulo">
              Facultad de Educación · Universidad del Cauca
            </p>
          </div>
        </div>

        <div className="layout-invitado__demo">
          👁 Modo Consulta Pública
          <br />
          (Demo)
        </div>

        <nav className="layout-invitado__nav">
          <NavLink
            to="/invitado"
            end
            className={({ isActive }) =>
              `layout-invitado__nav-link ${
                isActive ? 'layout-invitado__nav-link--activo' : ''
              }`
            }
          >
            <span className="layout-invitado__nav-icono">
              📖
            </span>

            <span>Diccionario Global</span>
          </NavLink>

          <NavLink
            to="/invitado"
            className="layout-invitado__nav-link"
          >
            <span className="layout-invitado__nav-icono">
              ▱
            </span>

            <span>Mazos de Estudio</span>
          </NavLink>
        </nav>

        <div className="layout-invitado__spacer" />

        <Link
          to="/login"
          className="layout-invitado__login"
        >
          ↪ Iniciar Sesión
        </Link>
      </aside>

      <div className="layout-invitado__contenido">
        <header className="layout-invitado__topbar">
          <div className="layout-invitado__institucion">
            Anglophone Literature
          </div>

          <input
            type="search"
            className="layout-invitado__busqueda"
            placeholder="Buscar término, fonética, cita o autor..."
            aria-label="Buscar término, fonética, cita o autor"
          />
        </header>

        <main className="layout-invitado__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}