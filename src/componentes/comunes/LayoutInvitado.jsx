import { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { useTheme } from '../../contexto/useTheme';
import './LayoutInvitado.css';

/**
 * Layout del modo invitado (consulta pública).
 *
 * Usa la misma estructura y las mismas clases globales que LayoutPrincipal
 * y Sidebar (app-shell, app-shell__sidebar, sidebar__*, topbar, pagina), de
 * modo que el invitado se ve igual que los demás roles: sidebar fijo,
 * botón de tema, responsive con menú ☰ y colores por rol (gris pizarra).
 * Lo único propio del invitado vive en LayoutInvitado.css: el aviso de
 * "Modo Consulta Pública" y el botón de "Iniciar sesión".
 */
export function LayoutInvitado() {
  const { tema, alternarTema } = useTheme();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <div className="app-shell app-shell--invitado">
      <aside
        className={`app-shell__sidebar app-shell__sidebar--invitado ${
          sidebarAbierto ? 'app-shell__sidebar--abierto' : ''
        }`}
      >
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon" aria-hidden="true" />
          <div>
            <p className="sidebar__brand-title">A Walking Dictionary</p>
            <p className="sidebar__brand-subtitle">Literatura Anglófona · Unicauca</p>
          </div>
        </div>

        <div className="sidebar__demo" role="note">
          Modo Consulta Pública
          <small>(Demo)</small>
        </div>

        <ul className="sidebar__nav">
          <li className="sidebar__nav-item">
            <NavLink
              to="/invitado"
              end
              onClick={() => setSidebarAbierto(false)}
              className={({ isActive }) => (isActive ? 'activo' : '')}
            >
              <span>Diccionario Global</span>
            </NavLink>
          </li>

          <li className="sidebar__nav-item">
            <NavLink to="/invitado" onClick={() => setSidebarAbierto(false)}>
              <span>Mazos de Estudio</span>
            </NavLink>
          </li>
        </ul>

        <div className="sidebar__footer">
          <Link to="/login" className="sidebar__iniciar">
            Iniciar sesión
          </Link>

          <button className="sidebar__tema-btn" type="button" onClick={alternarTema}>
            {tema === 'claro' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
          </button>

          <div className="sidebar__usuario">
            <div className="sidebar__avatar" aria-hidden="true" />
            <div>
              <p className="sidebar__usuario-nombre">Invitado</p>
              <p className="sidebar__usuario-rol">invitado</p>
            </div>
          </div>
        </div>
      </aside>

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
    </div>
  );
}
