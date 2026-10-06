import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../../contexto/useAuth';
import { useTheme } from '../../../contexto/useTheme';
// Registro comparte el diseño del Login (tarjeta central, botón de tema,
// botón de Google acorde al tema), por eso reutiliza sus estilos.
import '../Login.css';

/**
 * HU-012 (HU-5.1): registro autónomo de estudiante.
 *
 * Reutiliza el mismo flujo de Google Identity Services que Login.jsx,
 * pero llama a `registrarConGoogle` (POST /api/v1/auth/register) en vez
 * de `loginWithGoogle`. El backend valida correo institucional y crea la
 * cuenta en rol "estudiante"; devuelve { token, usuario } igual que el
 * login, así que la sesión queda iniciada de una vez.
 *
 * Al registrarse, el perfil académico (HU-013) siempre está incompleto,
 * así que se redirige directo a completarlo en vez de al panel principal
 * (donde de todos modos el menú aparecería deshabilitado, ver Sidebar.jsx).
 */
export function Registro() {
  const navigate = useNavigate();
  const { registrarConGoogle } = useAuth();
  const { tema, alternarTema } = useTheme();
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function manejarRegistroGoogle(credentialResponse) {
    if (!credentialResponse?.credential) {
      setError('No se recibió la credencial de Google.');
      return;
    }

    setError('');
    setCargando(true);

    try {
      const respuesta = await registrarConGoogle(credentialResponse.credential);

      if (respuesta.usuario.rol !== 'estudiante') {
        setError('El registro autónomo solo está disponible para estudiantes.');
        return;
      }

      navigate('/estudiante/configuracion-perfil', { replace: true });
    } catch (errorRegistro) {
      // El mensaje viene del backend vía apiRequest (p. ej. correo no
      // institucional, o cuenta ya existente — en ese caso el mensaje
      // debería sugerir iniciar sesión en vez de registrarse).
      setError(
        errorRegistro.message ||
          'No se pudo completar el registro. Intenta nuevamente.'
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

        <h1>Crear cuenta de estudiante</h1>
        <p className="login__subtitulo">Literatura Anglófona · Unicauca</p>

        <p className="login__texto">
          Regístrate con tu cuenta de Google institucional para empezar a
          usar A Walking Dictionary.
        </p>

        {error && (
          <p role="alert" className="aviso aviso--error login__error">
            {error}
          </p>
        )}

        {cargando ? (
          <p>Creando tu cuenta...</p>
        ) : (
          <div className="login__google">
            <GoogleLogin
              theme={tema === 'oscuro' ? 'filled_black' : 'outline'}
              width="300"
              text="signup_with"
              onSuccess={manejarRegistroGoogle}
              onError={() => setError('No se pudo completar el registro con Google.')}
            />
          </div>
        )}

        <p className="login__enlace">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}
