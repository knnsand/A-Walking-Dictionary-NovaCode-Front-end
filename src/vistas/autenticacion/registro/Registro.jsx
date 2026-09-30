import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../../contexto/useAuth';
import './registro.css';

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
    <main className="registro">
      <section className="registro__content">
        <h1>Crear cuenta de estudiante</h1>

        <p>
          Regístrate con tu cuenta de Google institucional para empezar a
          usar A Walking Dictionary.
        </p>

        {error && (
          <p role="alert" className="registro__error">
            {error}
          </p>
        )}

        {cargando ? (
          <p>Creando tu cuenta...</p>
        ) : (
          <GoogleLogin
            onSuccess={manejarRegistroGoogle}
            onError={() => setError('No se pudo completar el registro con Google.')}
          />
        )}

        <p className="registro__enlace">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}
