import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexto/useAuth';
import { useTheme } from '../../../contexto/useTheme';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';
import { obtenerPerfil, obtenerContextoAcademico } from '../../../cliente-api/perfilApi';
import { ConfigurarPerfilForm } from './ConfigurarPerfilForm';

export function ConfigurarPerfil() {
  const { t } = useTranslation();
  const { estudianteId, completarPerfilInicial } = useAuth();
  const { tema, alternarTema } = useTheme();
  const [perfil, setPerfil] = useState(null);
  const [contexto, setContexto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  // El título de la página lo pinta el layout (barra superior). Debe ir antes
  // de los return anticipados de abajo para respetar las reglas de los hooks.
  useEncabezadoPagina(
    t('profilePage.title'),
    t('profilePage.subtitle')
  );

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [datosPerfil, datosContexto] = await Promise.all([
          obtenerPerfil(estudianteId),
          obtenerContextoAcademico(estudianteId),
        ]);

        setPerfil(datosPerfil);
        setContexto(datosContexto);
      } catch (error) {
          console.error('Error al cargar el perfil:', error);
          // error.message viene del backend y puede estar en español (pendiente de revisar).
          setErrorCarga({ mensaje: error.message || null });
        } finally {
        setCargando(false);
      }
    }

    void cargarDatos();
  }, [estudianteId]);

  if (cargando) return <p>{t('profilePage.loading')}</p>;
  if (errorCarga) { return <p role="alert">{errorCarga.mensaje || t('profilePage.errors.loadFailed')}</p>;}

  return (
    <div className="configurar-perfil">
        <div className="configurar-perfil__grid">
        <section className="tarjeta">
            <h3>{t('profilePage.info.title')}</h3>
            <p><strong>{t('profilePage.info.fullName')}</strong> {perfil.nombre_completo}</p>
            <p><strong>{t('profilePage.info.institutionalEmail')}</strong> {perfil.correo}</p>
            <p><strong>{t('profilePage.info.institutionalRole')}</strong> {perfil.rol}</p>

            <ConfigurarPerfilForm
              datosIniciales={perfil}
              onPerfilActualizado={(perfilActualizado) => {
                setPerfil(perfilActualizado);
                // HU-012: primer guardado del perfil tras el registro →
                // se desbloquea el menú (y no se vuelve a exigir).
                completarPerfilInicial();
              }}
            />
        </section>

        <div className="configurar-perfil__columna-derecha">
            <section className="tarjeta">
            <h3>{t('profilePage.appearance.title')}</h3>
            <button className="sidebar__tema-btn" type="button" onClick={alternarTema}>
                {tema === 'claro'
                  ? `🌙 ${t('profilePage.appearance.switchToDark')}`
                  : `☀️ ${t('profilePage.appearance.switchToLight')}`}
            </button>
            </section>

            <section className="tarjeta tarjeta--contexto-academico">
            <h3>{t('profilePage.academic.title')}</h3>
            <p><strong>{t('profilePage.academic.assignedCourse')}</strong> {contexto.curso_asignado}</p>
            <p><strong>{t('profilePage.academic.activeSemester')}</strong> {contexto.semestre_activo}</p>
            <p><strong>{t('profilePage.academic.university')}</strong> {contexto.departamento_universidad}</p>
            </section>
        </div>
        </div>
    </div>
    );
}