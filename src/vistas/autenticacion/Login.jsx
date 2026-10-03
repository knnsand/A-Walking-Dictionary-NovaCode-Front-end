import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexto/useAuth';
import { useTheme } from '../../contexto/useTheme';
import { obtenerPerfil } from '../../cliente-api/perfilApi';
import { calcularPerfilCompleto } from '../../contexto/perfilCompleto';
import './Login.css';

export function Login() {
  const navigate = useNavigate();
  const { loginWithGoogle, logout } = useAuth();
  const { tema, alternarTema } = useTheme();
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function manejarLoginGoogle(credentialResponse) {
    if (!credentialResponse?.credential) {
      setError('No se recibió la credencial de Google.');
      return;
    }

    setError('');
    setCargando(true);

    try {
      const respuesta = await loginWithGoogle(credentialResponse.credential);

      if (respuesta.usuario.rol === 'docente') {
        navigate('/docente', { replace: true });
      } else if (respuesta.usuario.rol === 'estudiante') {
        // Si aún no ha completado su perfil, se le lleva a completarlo.
        let perfilCompleto = null;
        try {
          perfilCompleto = calcularPerfilCompleto(
            await obtenerPerfil(respuesta.usuario.id_usuario)
          );
        } catch {
          // Sin datos del perfil: se entra al panel normal.
        }

        navigate(
          perfilCompleto === false ? '/estudiante/configuracion-perfil' : '/estudiante',
          { replace: true }
        );
      } else {
        setError('El rol del usuario no es válido.');
      }
    } catch (errorLogin) {
      setError(
        errorLogin.message ||
          'No se pudo iniciar sesión. Intenta nuevamente.'
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login">
      <button type="button" className="login__tema" onClick={alternarTema}>
        {tema === 'claro' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
      </button>

      <section className="login__content">
        <div className="login__marca" aria-hidden="true" />

        <h1>A Walking Dictionary</h1>
        <p className="login__subtitulo">Literatura Anglófona · Unicauca</p>

        <p className="login__texto">
          Inicia sesión con tu cuenta de Google para continuar.
        </p>

        {error && (
          <p role="alert" className="aviso aviso--error login__error">
            {error}
          </p>
        )}

        {cargando ? (
          <p>Iniciando sesión...</p>
        ) : (
          <>
            <div className="login__google">
              <GoogleLogin
                theme={tema === 'oscuro' ? 'filled_black' : 'outline'}
                width="300"
                onSuccess={manejarLoginGoogle}
                onError={() => {
                  setError('No se pudo iniciar sesión con Google.');
                }}
              />
            </div>

            <button
              type="button"
              className="btn btn-secondary login__guest-button"
              onClick={() => {
                logout();
                navigate('/invitado');
              }}
            >
              Continuar como invitado
            </button>

            {/* HU-012: entrada al registro autónomo de estudiante. */}
            <p className="login__enlace">
              ¿Aún no tienes cuenta?{' '}
              <Link to="/registro">Regístrate como estudiante</Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
