import { useState } from 'react';
import { AuthContext } from './AuthContext';
import { iniciarSesionConGoogle } from '../cliente-api/authApi';

const TOKEN_KEY = 'walking_dictionary_token';
const USER_KEY = 'walking_dictionary_usuario';

const INSCRIPCION_ID_SIMULADA =
  Number(import.meta.env.VITE_INSCRIPCION_ID_SIMULADA) || null;

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

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(obtenerSesionGuardada);

  const { token, usuario } = sesion;

  async function loginWithGoogle(idToken) {
    const respuesta = await iniciarSesionConGoogle(idToken);

    localStorage.setItem(TOKEN_KEY, respuesta.token);
    localStorage.setItem(USER_KEY, JSON.stringify(respuesta.usuario));

    setSesion({
      token: respuesta.token,
      usuario: respuesta.usuario,
    });

    return respuesta;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setSesion({
      token: null,
      usuario: null,
    });
  }

  const rol = usuario?.rol || null;
  const idUsuario = usuario?.id_usuario || null;

  const docenteId = rol === 'docente' ? idUsuario : null;
  const estudianteId = rol === 'estudiante' ? idUsuario : null;

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        rol,
        idUsuario,
        docenteId,
        estudianteId,
        inscripcionId: INSCRIPCION_ID_SIMULADA,
        autenticado: Boolean(token && usuario),
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}