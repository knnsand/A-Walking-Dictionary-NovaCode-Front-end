import { NavLink, Link } from 'react-router-dom';
import './sidebar-perfil-pendiente.css';
import { useTheme } from '../../contexto/useTheme';

/**
 * Menú lateral. Es EL MISMO componente para Docente, Estudiante e
 * Invitado; lo único que cambia es qué secciones se renderizan,
 * definidas en MENU_POR_ROL según el rol activo.
 *
 * Props:
 * - rol: 'docente' | 'estudiante' | 'invitado'
 * - nombreUsuario, correoUsuario: para el pie del sidebar
 * - contadores: objeto opcional { pendientes: 2 } para badges (HU-004)
 * - perfilCompleto: boolean (HU-012). Si es `false` y el rol es
 *   "estudiante" (primer ingreso tras registrarse), las opciones del menú
 *   se muestran deshabilitadas excepto "Configuración & Perfil", hasta que
 *   guarde su perfil académico (HU-013).
 * - abierto / onCerrar: control del sidebar en móvil (responsive)
 * - onAbrirCrearMazo: callback del botón de acción del Docente (HU-001).
 *   El botón de Estudiante ("+ Añadir Palabra al Mazo") queda visible
 *   sin conectar: corresponde a HU-002, fuera del alcance actual.
 */
const MENU_POR_ROL = {
  docente: [
    {
      grupo: null,
      items: [
        { to: '/docente/diccionario', label: 'Diccionario Global' },
        { to: '/docente/mazos', label: 'Mazos de Estudio' },
      ],
    },
    {
      grupo: 'Gestión Docente Letras',
      items: [
        { to: '/docente/revision-palabras', label: 'Revisión de Palabras', badgeKey: 'pendientes' },
        { to: '/docente/cursos', label: 'Cursos & Estudiantes' },
        { to: '/docente/quices', label: 'Quices & Complejidad' },
        { to: '/docente/participacion', label: 'Analítica de Participación' },
      ],
    },
  ],
  estudiante: [
  {
    grupo: null,
    items: [
      { to: '/estudiante/diccionario', label: 'Diccionario Global' },
      { to: '/estudiante/mazos', label: 'Mazos de Estudio' },
    ],
  },
  {
    grupo: 'Mi Aprendizaje',
    items: [
      { to: '/estudiante/estudio', label: 'Modo Estudio' },
      { to: '/estudiante/quices', label: 'Quices Quincenales' },
      { to: '/estudiante/progreso', label: 'Progreso & Desempeño' },
    ],
  },
  {
    grupo: null,
    items: [
      { to: '/estudiante/configuracion-perfil', label: 'Configuración & Perfil' },
    ],
  },
],
  invitado: [
    {
      grupo: null,
      items: [
        { to: '/invitado/diccionario', label: 'Diccionario Global' },
        { to: '/invitado/mazos', label: 'Mazos de Estudio (demo)' },
      ],
    },
  ],
};

// HU-012: única ruta que sigue habilitada mientras el perfil está incompleto.
const RUTA_PERFIL_ESTUDIANTE = '/estudiante/configuracion-perfil';

export function Sidebar({
  rol,
  nombreUsuario,
  correoUsuario,
  contadores = {},
  perfilCompleto = true,
  abierto,
  onCerrar,
  onAbrirCrearMazo,
}) {
  const { tema, alternarTema } = useTheme();
  const secciones = MENU_POR_ROL[rol] ?? [];

  // HU-012: mientras el estudiante no complete su perfil académico
  // (HU-013) y sus datos personales, el resto de opciones del menú
  // quedan visibles pero deshabilitadas.
  const bloqueadoPorPerfil = rol === 'estudiante' && perfilCompleto === false;

  return (
  <aside
    className={`app-shell__sidebar app-shell__sidebar--${rol} ${
      abierto ? 'app-shell__sidebar--abierto' : ''
    }`}
  >


      <div className="sidebar__brand">
        <div className="sidebar__brand-icon" aria-hidden="true" />
        <div>
          <p className="sidebar__brand-title">A Walking Dictionary</p>
          <p className="sidebar__brand-subtitle">Literatura Anglófona · Unicauca</p>
        </div>
      </div>

      {rol === 'docente' && (
        <button className="sidebar__crear-btn" type="button" onClick={onAbrirCrearMazo}>
          + Crear Mazo de Estudio
        </button>
      )}

      {/* HU-002: fuera de alcance actual. Botón visible sin conectar. */}
      {rol === 'estudiante' && (
        <button className="sidebar__crear-btn sidebar__crear-btn--estudiante" type="button" disabled>
          + Añadir Palabra al Mazo
        </button>
      )}

      {secciones.map((seccion, indice) => (
        <div key={seccion.grupo ?? `seccion-${indice}`}>
          {seccion.grupo && <p className="sidebar__seccion-titulo">{seccion.grupo}</p>}
          <ul className="sidebar__nav">
            {seccion.items.map((item) => {
              const deshabilitado = bloqueadoPorPerfil && item.to !== RUTA_PERFIL_ESTUDIANTE;

              if (deshabilitado) {
                return (
                  <li className="sidebar__nav-item" key={item.to}>
                    <a
                      className="sidebar__nav-link--deshabilitado"
                      aria-disabled="true"
                      tabIndex={-1}
                      title="Completa tu perfil en Configuración & Perfil para habilitar esta opción"
                    >
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              }

              return (
                <li className="sidebar__nav-item" key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onCerrar}
                    className={({ isActive }) => (isActive ? 'activo' : '')}
                  >
                    <span>{item.label}</span>
                    {item.badgeKey && contadores[item.badgeKey] > 0 && (
                      <span className="sidebar__badge">{contadores[item.badgeKey]}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {bloqueadoPorPerfil && (
        <p className="sidebar__aviso-perfil" role="status">
          Ingresa a <Link to={RUTA_PERFIL_ESTUDIANTE}>Configuración &amp; Perfil</Link> y
          completa tu perfil académico para desbloquear estas opciones.
        </p>
      )}

      <div className="sidebar__footer">
        <button className="sidebar__tema-btn" type="button" onClick={alternarTema}>
          {tema === 'claro' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
        </button>
        <div className="sidebar__usuario">
          <div className="sidebar__avatar" aria-hidden="true" />
          <div>
            <p className="sidebar__usuario-nombre">{nombreUsuario ?? 'Invitado'}</p>
            <p className="sidebar__usuario-rol">{rol}</p>
            {correoUsuario && <p className="sidebar__usuario-correo">{correoUsuario}</p>}
          </div>
        </div>
      </div>
    </aside>
  );
}
