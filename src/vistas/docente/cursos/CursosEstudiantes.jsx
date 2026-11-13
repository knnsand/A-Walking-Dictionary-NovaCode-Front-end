
/** Gestión de cursos y estudiantes de la docente. */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  listarCursos,
  generarCodigoAcceso,
} from '../../../cliente-api/cursosApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';
import { ModalInscribirEstudiante } from '../inscribir-estudiante/ModalInscribirEstudiante';
import './cursos-estudiantes.css';

export function CursosEstudiantes() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [generandoId, setGenerandoId] = useState(null);
  const [copiadoId, setCopiadoId] = useState(null);
  const [aviso, setAviso] = useState({
    tipo: null,
    mensaje: null,
  });

  useEncabezadoPagina(
    t('coursesPage.title'),
    t('coursesPage.subtitle')
  );

  // Cargar los cursos académicos.
  useEffect(() => {
    let activo = true;

    listarCursos()
      .then((data) => {
        if (activo) {
          setCursos(data);
        }
      })
      .catch((error) => {
        if (activo) {
          setAviso({
            tipo: 'error',
            mensaje:
              error.message ||
              t('coursesPage.errors.loadFailed'),
          });
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [t]);

  // Generar o regenerar el código de acceso.
  async function handleGenerarCodigo(curso) {
    if (
      curso.codigo_acceso &&
      !window.confirm(t('coursesPage.confirmRegenerate'))
    ) {
      return;
    }

    setAviso({ tipo: null, mensaje: null });
    setGenerandoId(curso.id_curso);

    try {
      const { codigo_acceso } = await generarCodigoAcceso(
        curso.id_curso
      );

      setCursos((anteriores) =>
        anteriores.map((c) => {
          if (c.id_curso === curso.id_curso) {
            return { ...c, codigo_acceso };
          }

          return c;
        })
      );
    } catch (error) {
      setAviso({
        tipo: 'error',
        mensaje:
          error.message ||
          t('coursesPage.errors.generateFailed'),
      });
    } finally {
      setGenerandoId(null);
    }
  }

  // Copiar el código de acceso al portapapeles.
  async function handleCopiar(curso) {
    try {
      await navigator.clipboard.writeText(
        curso.codigo_acceso
      );

      setCopiadoId(curso.id_curso);

      setTimeout(() => {
        setCopiadoId(null);
      }, 1500);
    } catch {
      setAviso({
        tipo: 'error',
        mensaje: t('coursesPage.errors.copyFailed'),
      });
    }
  }

  let contenidoCursos;

  if (cargando) {
    contenidoCursos = (
      <p className="empty-state">
        {t('coursesPage.loading')}
      </p>
    );
  } else if (cursos.length === 0) {
    contenidoCursos = (
      <p className="empty-state">
        {t('coursesPage.empty')}
      </p>
    );
  } else {
    contenidoCursos = (
      <ul className="cursos-estudiantes__grid">
        {cursos.map((curso) => {
          // Nombre visible en inglés.
          let nombreCurso = curso.nombre;

          if (curso.nombre === 'Literatura Anglófona') {
            nombreCurso = 'Anglophone Literature';
          }

          // Texto del botón de generación de código.
          let textoBotonCodigo = t(
            'coursesPage.actions.generate'
          );

          if (generandoId === curso.id_curso) {
            textoBotonCodigo = t(
              'coursesPage.actions.generating'
            );
          } else if (curso.codigo_acceso) {
            textoBotonCodigo = t(
              'coursesPage.actions.regenerate'
            );
          }

          // Texto del botón de copia.
          let textoBotonCopiar = 'Copy code';

          if (copiadoId === curso.id_curso) {
            textoBotonCopiar = t(
              'coursesPage.actions.copied'
            );
          }

          return (
            <li
              className="cursos-estudiantes__card"
              key={curso.id_curso}
            >
              {/* Nombre del curso */}
              <h2 className="cursos-estudiantes__name">
                {nombreCurso}
              </h2>

              {/* Código de acceso y sus acciones */}
              <div className="cursos-estudiantes__code">
                <span className="cursos-estudiantes__code-label">
                  {t('coursesPage.courseCode')}
                </span>

                <strong className="cursos-estudiantes__code-value">
                  {curso.codigo_acceso ||
                    t('coursesPage.noCode')}
                </strong>

                <div className="cursos-estudiantes__code-actions">
                  {curso.codigo_acceso && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() =>
                        void handleCopiar(curso)
                      }
                    >
                      {textoBotonCopiar}
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      void handleGenerarCodigo(curso)
                    }
                    disabled={
                      generandoId === curso.id_curso
                    }
                  >
                    {textoBotonCodigo}
                  </button>
                </div>
              </div>

              {/* Acciones principales del curso */}
              <div className="cursos-estudiantes__actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setMostrarFormulario(true)
                  }
                >
                  {t('coursesPage.actions.addStudent')}
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    navigate(
                      `/docente/cursos/${curso.id_curso}`
                    )
                  }
                >
                  {t('coursesPage.actions.viewStudents')}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="cursos-estudiantes">
      <Aviso
        tipo={aviso.tipo}
        mensaje={aviso.mensaje}
      />

      {contenidoCursos}

      {mostrarFormulario && (
        <ModalInscribirEstudiante
          onCerrar={() =>
            setMostrarFormulario(false)
          }
        />
      )}
    </div>
  );
}
