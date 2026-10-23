import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../../contexto/useAuth';
import { useTheme } from '../../contexto/useTheme';
import { obtenerPerfil } from '../../cliente-api/perfilApi';
import { calcularPerfilCompleto } from '../../contexto/perfilCompleto';
import './Login.css';

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginWithGoogle, logout } = useAuth();
  const { tema, alternarTema } = useTheme();
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function manejarLoginGoogle(credentialResponse) {
    if (!credentialResponse?.credential) {
      setError(t('auth.errors.noGoogleCredential'));
      return;
    }

    setError('');
    setCargando(true);

    try {
      const respuesta = await loginWithGoogle(credentialResponse.credential);

      if (respuesta.usuario.rol === 'docente') {
        void navigate('/docente', { replace: true });
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

        void navigate(
          perfilCompleto === false ? '/estudiante/configuracion-perfil' : '/estudiante',
          { replace: true }
        );
      } else {
        setError(t('login.errors.invalidRole'));
      }
    } catch (errorLogin) {
      // errorLogin.message viene del backend y puede estar en español (pendiente de revisar).
      setError(errorLogin.message || t('login.errors.loginFailed'));
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login">
      <button type="button" className="login__tema" onClick={alternarTema}>
        {tema === 'claro' ? `🌙 ${t('auth.darkMode')}` : `☀️ ${t('auth.lightMode')}`}
      </button>

      <section className="login__content">
        <div className="login__marca" aria-hidden="true" />

        <h1>A Walking Dictionary</h1>
        <p className="login__subtitulo">{t('auth.subtitle')}</p>

        <p className="login__texto">{t('login.prompt')}</p>

        {error && (
          <p role="alert" className="aviso aviso--error login__error">
            {error}
          </p>
        )}

        {cargando ? (
          <p>{t('login.loggingIn')}</p>
        ) : (
          <>
            <div className="login__google">
              <GoogleLogin
                theme={tema === 'oscuro' ? 'filled_black' : 'outline'}
                width="300"
                locale="en"
                onSuccess={manejarLoginGoogle}
                onError={() => {
                  setError(t('login.errors.googleFailed'));
                }}
              />
            </div>

            <button
              type="button"
              className="btn btn-secondary login__guest-button"
              onClick={() => {
                logout();
                void navigate('/invitado');
              }}
            >
              {t('login.continueAsGuest')}
            </button>

            {/* HU-012: entrada al registro autónomo de estudiante. */}
            <p className="login__enlace">
              <Trans
                i18nKey="login.registerNotice"
                components={{ registerlink: <Link to="/registro" /> }}
              />
            </p>
          </>
        )}
      </section>
    </main>
  );
}