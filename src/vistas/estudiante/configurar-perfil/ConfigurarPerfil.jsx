import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexto/useAuth';
import { useTheme } from '../../../contexto/useTheme';
import { obtenerPerfil, obtenerContextoAcademico } from '../../../cliente-api/perfilApi';
import { ConfigurarPerfilForm } from './ConfigurarPerfilForm';

export function ConfigurarPerfil() {
  const { estudianteId } = useAuth();
  const { tema, alternarTema } = useTheme();
  const [perfil, setPerfil] = useState(null);
  const [contexto, setContexto] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      const [datosPerfil, datosContexto] = await Promise.all([
        obtenerPerfil(estudianteId),
        obtenerContextoAcademico(estudianteId),
      ]);
      setPerfil(datosPerfil);
      setContexto(datosContexto);
      setCargando(false);
    }
    cargarDatos();
  }, [estudianteId]);

  if (cargando) return <p>Cargando perfil...</p>;

  return (
    <div className="configurar-perfil">
        <p className="configurar-perfil__eyebrow">Preferencias & Identidad Académica</p>
        <h1 className="configurar-perfil__titulo">Configuración de la Cuenta</h1>

        <div className="configurar-perfil__grid">
        <section className="tarjeta">
            <h3>Información del Perfil</h3>
            <p><strong>Nombre completo:</strong> {perfil.nombre_completo}</p>
            <p><strong>Correo institucional:</strong> {perfil.correo}</p>
            <p><strong>Rol institucional:</strong> {perfil.rol}</p>

            <ConfigurarPerfilForm datosIniciales={perfil} onPerfilActualizado={setPerfil} />
        </section>

        <div className="configurar-perfil__columna-derecha">
            <section className="tarjeta">
            <h3>Apariencia del Sistema</h3>
            <button className="sidebar__tema-btn" type="button" onClick={alternarTema}>
                {tema === 'claro' ? '🌙 Cambiar a modo oscuro' : '☀️ Cambiar a modo claro'}
            </button>
            </section>

            <section className="tarjeta tarjeta--contexto-academico">
            <h3>Contexto Académico</h3>
            <p><strong>Curso asignado:</strong> {contexto.curso_asignado}</p>
            <p><strong>Semestre activo:</strong> {contexto.semestre_activo}</p>
            <p><strong>Departamento y universidad:</strong> {contexto.departamento_universidad}</p>
            </section>
        </div>
        </div>
    </div>
    );
}