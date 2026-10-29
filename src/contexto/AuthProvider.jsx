/**
 * @file AuthProvider.jsx
 * @brief Proveedor de la sesión: guarda el token y el usuario en localStorage, consulta si el
 * perfil del estudiante está completo y obtiene su inscripción activa.
 */

import { useCallback, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import {
  iniciarSesionConGoogle,
  registrarConGoogle as registrarConGoogleApi,
} from '../cliente-api/authApi';
import { obtenerContextoAcademico, obtenerPerfil } from '../cliente-api/perfilApi';
import { calcularPerfilCompleto } from './perfilCompleto';

/** @brief Clave de localStorage donde se guarda el JWT. */
const TOKEN_KEY = 'walking_dictionary_token';
/** @brief Clave de localStorage donde se guarda el usuario autenticado. */
const USER_KEY = 'walking_dictionary_usuario';

/** @brief Inscripción de respaldo (VITE_INSCRIPCION_ID_SIMULADA) si no se puede consultar la real. */
const INSCRIPCION_ID_SIMULADA =
  Number(import.meta.env.VITE_INSCRIPCION_ID_SIMULADA) || null;

/**
 * @brief Recupera la sesión guardada en localStorage; si está corrupta, la borra.
 * @return {{token: string|null, usuario: Object|null}} Sesión guardada o vacía.
 */
function obtenerSesionGuardada() {
  const tokenGuardado = localStorage.getItem(TOKEN_KEY);
  const usuarioGuardado = localStorage.getItem(USER_KEY);

  if (!tokenGuardado || !usuarioGuardado) {
    return {
      token: null,
      usuario: null,
    };
  }

  try {
    return {
      token: tokenGuardado,
      usuario: JSON.parse(usuarioGuardado),
    };
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    return {
      token: null,
      usuario: null,
    };
  }
}

/**
 * @brief Componente que comparte la sesión con toda la aplicación mediante AuthContext.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Árbol de componentes que tendrá acceso a la sesión.
 * @return {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(obtenerSesionGuardada);

  // HU-012: true/false según los datos en BD; null = aún no se sabe o no
  // aplica (docente, invitado). Solo `false` bloquea el menú del estudiante.
  const [perfilCompleto, setPerfilCompleto] = useState(null);

  const { token, usuario } = sesion;

  const rol = usuario?.rol || null;
  const idUsuario = usuario?.id_usuario || null;

  const docenteId = rol === 'docente' ? idUsuario : null;
  const estudianteId = rol === 'estudiante' ? idUsuario : null;

  const refrescarPerfil = useCallback(async () => {
    if (!estudianteId) {
      setPerfilCompleto(null);
      return;
    }

    try {
      const perfil = await obtenerPerfil(estudianteId);
      setPerfilCompleto(calcularPerfilCompleto(perfil));
    } catch {
      // Si no se puede consultar, no se bloquea el menú.
      setPerfilCompleto(null);
    }
  }, [estudianteId]);

  // Al montar (sesión restaurada) y cada vez que cambia el estudiante
  // autenticado (login, registro, logout).
  useEffect(() => {
    void refrescarPerfil();
  }, [refrescarPerfil]);

  // Inscripción real del estudiante (id_inscripcion de GET /students/:id/context).
  // VITE_INSCRIPCION_ID_SIMULADA solo se usa como respaldo si no se puede consultar.
  // Se guarda junto al estudiante consultado para saber si corresponde al actual.
  const [inscripcion, setInscripcion] = useState({ estudianteId: null, id: null });

  useEffect(() => {
    if (!estudianteId) return undefined;

    let cancelado = false;

    obtenerContextoAcademico(estudianteId)
      .then((contexto) => {
        if (!cancelado) setInscripcion({ estudianteId, id: contexto?.id_inscripcion ?? null });
      })
      .catch(() => {
        if (!cancelado) setInscripcion({ estudianteId, id: INSCRIPCION_ID_SIMULADA });
      });

    return () => {
      cancelado = true;
    };
  }, [estudianteId]);

  const inscripcionCargando = Boolean(estudianteId) && inscripcion.estudianteId !== estudianteId;
  const inscripcionId =
    estudianteId && inscripcion.estudianteId === estudianteId ? inscripcion.id : null;

  /**
   * @brief Guarda el token y el usuario en localStorage y en el estado.
   * @param {{token: string, usuario: Object}} respuesta - Respuesta del login o registro.
   * @param {{esRegistro?: boolean}} [opciones] - Si es un registro, marca el perfil como incompleto.
   */
  function guardarSesion(respuesta, { esRegistro = false } = {}) {
    localStorage.setItem(TOKEN_KEY, respuesta.token);
    localStorage.setItem(USER_KEY, JSON.stringify(respuesta.usuario));
    setSesion({ token: respuesta.token, usuario: respuesta.usuario });

    // Recién registrado: el perfil siempre está incompleto, sin esperar red.
    if (esRegistro && respuesta.usuario?.rol === 'estudiante') {
      setPerfilCompleto(false);
    }
  }

  /**
   * @brief Inicia sesión con Google y guarda la sesión.
   * @param {string} idToken - Token de identidad de Google.
   * @return {Promise<{token: string, usuario: Object}>} Respuesta del backend.
   */
  async function loginWithGoogle(idToken) {
    const respuesta = await iniciarSesionConGoogle(idToken);
    guardarSesion(respuesta);
    return respuesta;
  }

  /**
   * @brief HU-012: registro autónomo de estudiante con Google.
   * @param {string} idToken - Token de identidad de Google.
   * @return {Promise<{token: string, usuario: Object}>} Respuesta del backend.
   */
  async function registrarConGoogle(idToken) {
    const respuesta = await registrarConGoogleApi(idToken);
    guardarSesion(respuesta, { esRegistro: true });
    return respuesta;
  }

  /** @brief Se llama al guardar el perfil (campos obligatorios ya validados). */
  function completarPerfilInicial() {
    setPerfilCompleto(true);
  }

  /** @brief Cierra la sesión: borra el token y el usuario de localStorage y del estado. */
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setSesion({ token: null, usuario: null });
    setPerfilCompleto(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        rol,
        idUsuario,
        docenteId,
        estudianteId,
        inscripcionId,
        inscripcionCargando,
        autenticado: Boolean(token && usuario),
        perfilCompleto,
        completarPerfilInicial,
        loginWithGoogle,
        registrarConGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
