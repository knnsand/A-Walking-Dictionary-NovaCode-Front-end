import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { listarCursos, generarCodigoAcceso } from '../../../cliente-api/cursosApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';

import { ModalInscribirEstudiante } from '../inscribir-estudiante/ModalInscribirEstudiante';

export function CursosEstudiantes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [generandoId, setGenerandoId] = useState(null);
  const [copiadoId, setCopiadoId] = useState(null);
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });

  // El título de la página lo pinta el layout (barra superior).
  useEncabezadoPagina(
    t('coursesPage.title'),
    t('coursesPage.subtitle')
  );

  useEffect(() => {
    listarCursos().then(setCursos);
  }, []);

  async function handleGenerarCodigo(curso) {
    // Si ya hay código, regenerar invalida el anterior: pedimos confirmación.
    if (
      curso.codigo_acceso &&
      !window.confirm(t('coursesPage.confirmRegenerate'))
    ) {
      return;
    }

    setAviso({ tipo: null, mensaje: null });
    setGenerandoId(curso.id_curso);
    try {
      const { codigo_acceso } = await generarCodigoAcceso(curso.id_curso);
      setCursos((anteriores) =>
        anteriores.map((c) =>
          c.id_curso === curso.id_curso ? { ...c, codigo_acceso } : c
        )
      );
    } catch (error) {
      // error.message viene del backend y puede estar en español (pendiente de revisar).
      setAviso({
        tipo: 'error',
        mensaje: error.message || t('coursesPage.errors.generateFailed'),
      });
    } finally {
      setGenerandoId(null);
    }
  }

  async function handleCopiar(curso) {
    try {
      await navigator.clipboard.writeText(curso.codigo_acceso);
      setCopiadoId(curso.id_curso);
      setTimeout(() => setCopiadoId(null), 1500);
    } catch {
      setAviso({ tipo: 'error', mensaje: t('coursesPage.errors.copyFailed') });
    }
  }

  return (
    <div className="cursos-estudiantes">
      <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />

      {cursos.length === 0 ? (
        <p className="empty-state">
          {t('coursesPage.empty')}
        </p>
      ) : (
        <ul className="mazo-list mazo-list--tarjetas">
          {cursos.map((curso) => (
            <li
              className="mazo-list__item mazo-list__item--clicable"
              key={curso.id_curso}
              role="link"
              tabIndex={0}
              onClick={() => navigate(String(curso.id_curso))}
              onKeyDown={(e) => {
                if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  navigate(String(curso.id_curso));
                }
              }}
            >
              <div className="mazo-list__info">
                <strong>{curso.nombre}</strong>
                <span className="mazo-list__meta">
                  {t('coursesPage.academicGroup')}
                </span>
              </div>

              <div className="mazo-list__info">
                <span className="mazo-list__meta">
                  {t('coursesPage.courseCode')}
                </span>
                <strong>{curso.codigo_acceso || t('coursesPage.noCode')}</strong>
              </div>

              <div className="mazo-list__info">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => { e.stopPropagation(); handleGenerarCodigo(curso); }}
                  disabled={generandoId === curso.id_curso}
                >
                  {generandoId === curso.id_curso
                    ? t('coursesPage.actions.generating')
                    : curso.codigo_acceso
                      ? t('coursesPage.actions.regenerate')
                      : t('coursesPage.actions.generate')}
                </button>

                {curso.codigo_acceso && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={(e) => { e.stopPropagation(); handleCopiar(curso); }}
                  >
                    {copiadoId === curso.id_curso ? t('coursesPage.actions.copied') : t('coursesPage.actions.copy')}
                  </button>
                )}
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={(e) => { e.stopPropagation(); setMostrarFormulario(true); }}
              >
                {t('coursesPage.actions.addStudent')}
              </button>
            </li>
          ))}
        </ul>
      )}

      {mostrarFormulario && (
        <ModalInscribirEstudiante
          onCerrar={() => setMostrarFormulario(false)}
        />
      )}
    </div>
  );
}