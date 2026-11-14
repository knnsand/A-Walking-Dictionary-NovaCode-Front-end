/**
 * @file GestionUsuarios.jsx
 * @brief HU-023: vista del administrador para listar, buscar y filtrar usuarios
 * (CA-23.1) y cambiar su rol o activar y desactivar su cuenta (CA-23.2).
 *
 * Los errores del backend se traducen por su `code` (ADMIN_*, AUTH_*, RATE_LIMITED);
 * los controles de la fila del propio administrador quedan deshabilitados, porque el
 * backend igual respondería 409 (ADMIN_SELF_CHANGE).
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexto/useAuth';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';
import {
  cambiarEstadoUsuario,
  cambiarRolUsuario,
  listarUsuarios,
  ROLES_ASIGNABLES,
} from '../../../cliente-api/adminUsuariosApi';
import './gestion-usuarios.css';

const FILTROS_INICIALES = { search: '', rol: '', activo: '' };

/**
 * @brief Pantalla de gestión de usuarios del administrador.
 * @return {JSX.Element}
 */
export function GestionUsuarios() {
  const { t } = useTranslation();
  const { idUsuario } = useAuth();

  useEncabezadoPagina(t('adminUsers.title'), t('adminUsers.subtitle'));

  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);
  const [respuesta, setRespuesta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [guardandoId, setGuardandoId] = useState(null);
  const [recarga, setRecarga] = useState(0);

  /**
   * @brief Traduce el error del backend por su `code`; si no hay traducción, usa el genérico.
   * @param {Error & {cuerpo?: {code?: string}}} errorApi - Error lanzado por apiRequest.
   * @return {string} Mensaje para mostrar.
   */
  function mensajeDeError(errorApi) {
    const codigo = errorApi?.cuerpo?.code;
    if (!codigo) return t('adminUsers.errors.generic');
    return t(`adminUsers.errors.${codigo}`, { defaultValue: t('adminUsers.errors.generic') });
  }

  // CA-23.1: carga la página actual con los filtros aplicados.
  useEffect(() => {
    let cancelado = false;
    listarUsuarios({ ...filtros, page: pagina })
      .then((datos) => {
        if (cancelado) return;
        setRespuesta(datos);
        setError(null);
      })
      .catch((errorApi) => {
        if (!cancelado) setError(mensajeDeError(errorApi));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
    // mensajeDeError solo depende de t.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros, pagina, recarga, t]);

  /** @brief Aplica los filtros y vuelve a la primera página. */
  function aplicarFiltros(nuevos) {
    setCargando(true);
    setAviso(null);
    setPagina(1);
    setFiltros((anteriores) => ({ ...anteriores, ...nuevos }));
  }

  function buscar(evento) {
    evento.preventDefault();
    aplicarFiltros({ search: textoBusqueda.trim() });
  }

  function limpiarFiltros() {
    setTextoBusqueda('');
    setCargando(true);
    setAviso(null);
    setPagina(1);
    setFiltros(FILTROS_INICIALES);
  }

  function irAPagina(nueva) {
    setCargando(true);
    setPagina(nueva);
  }

  function reintentar() {
    setCargando(true);
    setError(null);
    setRecarga((valor) => valor + 1);
  }

  /** @brief Reemplaza en la tabla la fila del usuario que devolvió el backend. */
  function actualizarFila(usuarioActualizado) {
    setRespuesta((anterior) => ({
      ...anterior,
      data: anterior.data.map((fila) =>
        fila.id_usuario === usuarioActualizado.id_usuario ? { ...fila, ...usuarioActualizado } : fila
      ),
    }));
  }

  /**
   * @brief Ejecuta un cambio confirmado y muestra el resultado (CA-23.2: "y confirma").
   * @param {Object} usuario - Fila afectada.
   * @param {string} confirmacion - Texto de la confirmación.
   * @param {Function} accion - Llamada a la API.
   * @param {string} exito - Mensaje de éxito.
   */
  async function aplicarCambio(usuario, confirmacion, accion, exito) {
    if (!window.confirm(confirmacion)) return;
    setGuardandoId(usuario.id_usuario);
    setAviso(null);
    try {
      actualizarFila(await accion());
      setAviso({ tipo: 'exito', mensaje: exito });
    } catch (errorApi) {
      setAviso({ tipo: 'error', mensaje: mensajeDeError(errorApi) });
    } finally {
      setGuardandoId(null);
    }
  }

  function cambiarRol(usuario, rol) {
    if (rol === usuario.rol) return;
    const nombreRol = t(`roles.${rol}`);
    void aplicarCambio(
      usuario,
      t('adminUsers.confirmRole', { name: usuario.nombre_completo, role: nombreRol }),
      () => cambiarRolUsuario(usuario.id_usuario, rol),
      t('adminUsers.roleChanged', { name: usuario.nombre_completo, role: nombreRol })
    );
  }

  function cambiarEstado(usuario) {
    const activar = !usuario.activo;
    void aplicarCambio(
      usuario,
      t(activar ? 'adminUsers.confirmActivate' : 'adminUsers.confirmDeactivate', {
        name: usuario.nombre_completo,
      }),
      () => cambiarEstadoUsuario(usuario.id_usuario, activar),
      t(activar ? 'adminUsers.activated' : 'adminUsers.deactivated', { name: usuario.nombre_completo })
    );
  }

  function formatearFecha(fecha) {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString();
  }

  const usuarios = respuesta?.data ?? [];
  const totalPaginas = respuesta?.total_pages ?? 0;
  const hayFiltros = Boolean(filtros.search || filtros.rol || filtros.activo);

  return (
    <section className="gestion-usuarios">
      <form className="gestion-usuarios__filtros" onSubmit={buscar} role="search">
        <label className="gestion-usuarios__campo gestion-usuarios__campo--busqueda">
          <span>{t('adminUsers.searchLabel')}</span>
          <input
            type="search"
            value={textoBusqueda}
            maxLength={100}
            placeholder={t('adminUsers.searchPlaceholder')}
            onChange={(evento) => setTextoBusqueda(evento.target.value)}
          />
        </label>

        <label className="gestion-usuarios__campo">
          <span>{t('adminUsers.roleFilter')}</span>
          <select value={filtros.rol} onChange={(evento) => aplicarFiltros({ rol: evento.target.value })}>
            <option value="">{t('adminUsers.allRoles')}</option>
            {ROLES_ASIGNABLES.map((rol) => (
              <option key={rol} value={rol}>
                {t(`roles.${rol}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="gestion-usuarios__campo">
          <span>{t('adminUsers.statusFilter')}</span>
          <select value={filtros.activo} onChange={(evento) => aplicarFiltros({ activo: evento.target.value })}>
            <option value="">{t('adminUsers.allStatuses')}</option>
            <option value="true">{t('adminUsers.active')}</option>
            <option value="false">{t('adminUsers.inactive')}</option>
          </select>
        </label>

        <div className="gestion-usuarios__acciones-filtro">
          <button type="submit" className="btn btn-primary">
            {t('adminUsers.search')}
          </button>
          {hayFiltros && (
            <button type="button" className="btn btn-secondary" onClick={limpiarFiltros}>
              {t('adminUsers.clearFilters')}
            </button>
          )}
        </div>
      </form>

      {aviso && (
        <p className={`aviso aviso--${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>
          {aviso.mensaje}
        </p>
      )}

      {cargando && <p className="empty-state">{t('adminUsers.loading')}</p>}

      {!cargando && error && (
        <div className="aviso aviso--error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn-secondary" onClick={reintentar}>
            {t('adminUsers.retry')}
          </button>
        </div>
      )}

      {!cargando && !error && usuarios.length === 0 && (
        <p className="empty-state">{t('adminUsers.empty')}</p>
      )}

      {!cargando && !error && usuarios.length > 0 && (
        <>
          <p className="gestion-usuarios__total">{t('adminUsers.total', { count: respuesta.total })}</p>

          <div className="gestion-usuarios__tabla-contenedor">
            <table className="gestion-usuarios__tabla">
              <thead>
                <tr>
                  <th scope="col">{t('adminUsers.columns.name')}</th>
                  <th scope="col">{t('adminUsers.columns.email')}</th>
                  <th scope="col">{t('adminUsers.columns.role')}</th>
                  <th scope="col">{t('adminUsers.columns.status')}</th>
                  <th scope="col">{t('adminUsers.columns.registered')}</th>
                  <th scope="col">{t('adminUsers.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => {
                  const esPropio = usuario.id_usuario === idUsuario;
                  const bloqueado = esPropio || guardandoId === usuario.id_usuario;
                  return (
                    <tr key={usuario.id_usuario}>
                      <td>
                        {usuario.nombre_completo}
                        {esPropio && <span className="gestion-usuarios__tu-cuenta"> ({t('adminUsers.you')})</span>}
                      </td>
                      <td>{usuario.email}</td>
                      <td>
                        <select
                          value={usuario.rol}
                          disabled={bloqueado}
                          title={esPropio ? t('adminUsers.ownAccount') : undefined}
                          aria-label={t('adminUsers.roleOf', { name: usuario.nombre_completo })}
                          onChange={(evento) => cambiarRol(usuario, evento.target.value)}
                        >
                          {ROLES_ASIGNABLES.map((rol) => (
                            <option key={rol} value={rol}>
                              {t(`roles.${rol}`)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span
                          className={`gestion-usuarios__estado gestion-usuarios__estado--${
                            usuario.activo ? 'activo' : 'inactivo'
                          }`}
                        >
                          {t(usuario.activo ? 'adminUsers.active' : 'adminUsers.inactive')}
                        </span>
                      </td>
                      <td>{formatearFecha(usuario.fecha_registro)}</td>
                      <td>
                        <button
                          type="button"
                          className={`btn ${usuario.activo ? 'btn-rechazar' : 'btn-secondary'}`}
                          disabled={bloqueado}
                          title={esPropio ? t('adminUsers.ownAccount') : undefined}
                          onClick={() => cambiarEstado(usuario)}
                        >
                          {t(usuario.activo ? 'adminUsers.deactivate' : 'adminUsers.activate')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <nav className="gestion-usuarios__paginacion" aria-label={t('adminUsers.pagination')}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={pagina <= 1}
                onClick={() => irAPagina(pagina - 1)}
              >
                {t('adminUsers.previous')}
              </button>
              <span>{t('adminUsers.pageOf', { page: pagina, total: totalPaginas })}</span>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={pagina >= totalPaginas}
                onClick={() => irAPagina(pagina + 1)}
              >
                {t('adminUsers.next')}
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
