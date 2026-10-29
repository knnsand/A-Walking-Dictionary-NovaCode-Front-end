import { NavLink, Link } from 'react-router-dom';
import './sidebar-perfil-pendiente.css';
import './LayoutInvitado.css';
import { useTheme } from '../../contexto/useTheme';
import { useTranslation, Trans } from 'react-i18next';

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
 * - onAbrirRegistrarTarjeta: callback del botón de acción del Estudiante
 *   ("+ Añadir Palabra al Mazo", HU-002). Abre el modal de registro de
 *   palabra. El botón se deshabilita mientras el perfil esté incompleto.
 * - onAbrirUnirseCurso: callback del botón "Unirme a un curso" del Estudiante
 *   (abre el modal de inscripción por código de acceso).
 * - onCerrarSesion: callback del botón "Cerrar sesión" (docente y
 *   estudiante; el invitado no tiene sesión).
 */
const MENU_POR_ROL = {
  docente: [
    {
      grupoKey: null,
      items: [
        { to: '/docente/diccionario', labelKey: 'sidebar.menu.globalDictionary' },
        { to: '/docente/mazos', labelKey: 'sidebar.menu.studyDecks' },
      ],
    },
    {
      grupoKey: 'sidebar.groups.teacherManagement',
      items: [
        { to: '/docente/revision-palabras', labelKey: 'sidebar.menu.wordReview', badgeKey: 'pendientes' },
        { to: '/docente/cursos', labelKey: 'sidebar.menu.coursesAndStudents' },
        { to: '/docente/quices', labelKey: 'sidebar.menu.quizzesAndDifficulty' },
        { to: '/docente/participacion', labelKey: 'sidebar.menu.participationAnalytics' },
      ],
    },
  ],
  estudiante: [
    {
      grupoKey: null,
      items: [
        { to: '/estudiante/diccionario', labelKey: 'sidebar.menu.globalDictionary' },
        { to: '/estudiante/mazos', labelKey: 'sidebar.menu.studyDecks' },
      ],
    },
    {
      grupoKey: 'sidebar.groups.myLearning',
      items: [
        { to: '/estudiante/estudio', labelKey: 'sidebar.menu.studyMode' },
        { to: '/estudiante/quices', labelKey: 'sidebar.menu.quizzes' },
        { to: '/estudiante/progreso', labelKey: 'sidebar.menu.progressAndPerformance' },
      ],
    },
    {
      grupoKey: null,
      items: [
        { to: '/estudiante/configuracion-perfil', labelKey: 'sidebar.menu.settingsAndProfile' },
      ],
    },
  ],
  invitado: [
    {
      grupoKey: null,
      items: [
        { to: '/invitado/diccionario', labelKey: 'sidebar.menu.globalDictionary' },
        { to: '/invitado/mazos', labelKey: 'sidebar.menu.studyDecks' },
      ],
    },
  ],
};

// HU-012: única ruta que sigue habilitada mientras el perfil está incompleto.
const RUTA_PERFIL_ESTUDIANTE = '/estudiante/configuracion-perfil';

// Secciones que aún no están implementadas.
const RUTAS_DESHABILITADAS_POR_ROL = {
  docente: [
    
  ],
  estudiante: [
    
    
  ],
  invitado: [
    
    
  ],
};

export function Sidebar({
  rol,
  nombreUsuario,
  correoUsuario,
  contadores = {},
  perfilCompleto = true,
  abierto,
  onCerrar,
  onAbrirCrearMazo,
  onAbrirRegistrarTarjeta,
  onAbrirUnirseCurso,
  onCerrarSesion,
}) {
  const { tema, alternarTema } = useTheme();
  const { t } = useTranslation();
  const secciones = MENU_POR_ROL[rol] ?? [];

  // HU-012: mientras el estudiante no complete su perfil académico
  // (HU-013) y sus datos personales, el resto de opciones del menú
  // quedan visibles pero deshabilitadas.
  const bloqueadoPorPerfil = rol === 'estudiante' && perfilCompleto === false;

  const rutasDeshabilitadas = RUTAS_DESHABILITADAS_POR_ROL[rol] ?? [];

  // Abre el modal de registro y, en móvil, cierra el menú lateral para que
  // el modal no quede tapado por el sidebar.
  const manejarAnadirPalabra = () => {
    onAbrirRegistrarTarjeta?.();
    onCerrar?.();
  };

  // Abre el modal de inscripción a un curso y, en móvil, cierra el menú lateral.
  const manejarUnirseCurso = () => {
    onAbrirUnirseCurso?.();
    onCerrar?.();
  };

  return (
    <aside
      className={`app-shell__sidebar app-shell__sidebar--${rol} ${
        abierto ? 'app-shell__sidebar--abierto' : ''
      }`}
    >
      <div className="sidebar__brand">
        <img
          src="/logo-unicauca.svg"
          alt={t('sidebar.brand.logoAlt')}
          className="sidebar__brand-logo"
        />
        <div>
          <p className="sidebar__brand-title">A Walking Dictionary</p>
          <p className="sidebar__brand-subtitle">{t('sidebar.brand.subtitle')}</p>
          <p className="sidebar__brand-subtitle">{t('sidebar.brand.institution')}</p>
        </div>
      </div>

      {rol === 'docente' && (
        <button
          className="sidebar__crear-btn"
          type="button"
          onClick={onAbrirCrearMazo}
        >
          {t('sidebar.actions.createDeck')}
        </button>
      )}

      {/* HU-002: registro de palabra. Se deshabilita solo si el perfil está incompleto (HU-012). */}
      {rol === 'estudiante' && (
        <button
          className="sidebar__crear-btn sidebar__crear-btn--estudiante"
          type="button"
          onClick={manejarAnadirPalabra}
          disabled={bloqueadoPorPerfil}
          title={
            bloqueadoPorPerfil
              ? t('sidebar.tooltips.completeProfile')
              : undefined
          }
        >
          {t('sidebar.actions.addWord')}
        </button>
      )}

      {/* Inscripción a un curso con el código de acceso que da el docente. */}
      {rol === 'estudiante' && (
        <button
          className="sidebar__secundario-btn"
          type="button"
          onClick={manejarUnirseCurso}
        >
          {t('sidebar.actions.joinCourse')}
        </button>
      )}

      {rol === 'invitado' && (
        <div className="sidebar__demo" role="note">
          {t('sidebar.guest.modeTitle')}
          <small>{t('sidebar.guest.modeDemo')}</small>
        </div>
      )}

      {secciones.map((seccion, indice) => (
        <div key={seccion.grupoKey ?? `seccion-${indice}`}>
          {seccion.grupoKey && (
            <p className="sidebar__seccion-titulo">{t(seccion.grupoKey)}</p>
          )}

          <ul className="sidebar__nav">
            {seccion.items.map((item) => {
              const deshabilitadoPorPerfil =
                bloqueadoPorPerfil && item.to !== RUTA_PERFIL_ESTUDIANTE;

              const deshabilitadoPorImplementacion =
                rutasDeshabilitadas.includes(item.to);

              const deshabilitado =
                deshabilitadoPorPerfil || deshabilitadoPorImplementacion;

              if (deshabilitado) {
                return (
                  <li className="sidebar__nav-item" key={item.to}>
                    <a
                      className="sidebar__nav-link--deshabilitado"
                      aria-disabled="true"
                      tabIndex={-1}
                      title={
                        deshabilitadoPorPerfil
                          ? t('sidebar.tooltips.completeProfile')
                          : t('sidebar.tooltips.notAvailable')
                      }
                    >
                      <span>{t(item.labelKey)}</span>
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
                    <span>{t(item.labelKey)}</span>
                    {item.badgeKey && contadores[item.badgeKey] > 0 && (
                      <span className="sidebar__badge">
                        {contadores[item.badgeKey]}
                      </span>
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
          <Trans
            i18nKey="sidebar.profileNotice"
            components={{ profilelink: <Link to={RUTA_PERFIL_ESTUDIANTE} /> }}
          />
        </p>
      )}

      <div className="sidebar__footer">
        {rol === 'invitado' && (
          <Link to="/login" className="sidebar__iniciar">
            {t('sidebar.actions.logIn')}
          </Link>
        )}

        <button
          className="sidebar__tema-btn"
          type="button"
          onClick={alternarTema}
        >
          {tema === 'claro' ? `🌙 ${t('sidebar.theme.dark')}` : `☀️ ${t('sidebar.theme.light')}`}
        </button>

        <div className="sidebar__usuario">
          <div className="sidebar__avatar" aria-hidden="true" />
          <div>
            <p className="sidebar__usuario-nombre">
              {nombreUsuario ?? t('sidebar.guest.name')}
            </p>
            <p className="sidebar__usuario-rol">{t(`roles.${rol}`, { defaultValue: rol })}</p>
            {correoUsuario && (
              <p className="sidebar__usuario-correo">{correoUsuario}</p>
            )}
          </div>
        </div>

        {rol !== 'invitado' && (
          <button
            className="sidebar__logout"
            type="button"
            onClick={onCerrarSesion}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {t('sidebar.actions.logOut')}
          </button>
        )}
      </div>
    </aside>
  );
}