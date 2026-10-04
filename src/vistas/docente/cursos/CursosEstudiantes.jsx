import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { listarCursos, generarCodigoAcceso } from '../../../cliente-api/cursosApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';

import { ModalInscribirEstudiante } from '../inscribir-estudiante/ModalInscribirEstudiante';

export function CursosEstudiantes() {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [generandoId, setGenerandoId] = useState(null);
  const [copiadoId, setCopiadoId] = useState(null);
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });

  // El título de la página lo pinta el layout (barra superior).
  useEncabezadoPagina(
    'Cursos Académicos y Cohortes',
    'Administra tus cursos y estudiantes inscritos.'
  );

  useEffect(() => {
    listarCursos().then(setCursos);
  }, []);

  async function handleGenerarCodigo(curso) {
    // Si ya hay código, regenerar invalida el anterior: pedimos confirmación.
    if (
      curso.codigo_acceso &&
      !window.confirm(
        'Ya existe un código para este curso. Si generas uno nuevo, el anterior dejará de funcionar. ¿Continuar?'
      )
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
      setAviso({
        tipo: 'error',
        mensaje: error.message || 'No se pudo generar el código del curso.',
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
      setAviso({ tipo: 'error', mensaje: 'No se pudo copiar el código.' });
    }
  }

  return (
    <div className="cursos-estudiantes">
      <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />

      {cursos.length === 0 ? (
        <p className="empty-state">
          Todavía no hay cursos registrados.
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
                  Grupo académico
                </span>
              </div>

              <div className="mazo-list__info">
                <span className="mazo-list__meta">
                  Código del curso
                </span>
                <strong>{curso.codigo_acceso || 'Sin código'}</strong>
              </div>

              <div className="mazo-list__info">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => { e.stopPropagation(); handleGenerarCodigo(curso); }}
                  disabled={generandoId === curso.id_curso}
                >
                  {generandoId === curso.id_curso
                    ? 'Generando...'
                    : curso.codigo_acceso
                      ? 'Regenerar código'
                      : 'Generar código'}
                </button>

                {curso.codigo_acceso && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={(e) => { e.stopPropagation(); handleCopiar(curso); }}
                  >
                    {copiadoId === curso.id_curso ? '¡Copiado!' : 'Copiar'}
                  </button>
                )}
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={(e) => { e.stopPropagation(); setMostrarFormulario(true); }}
              >
                Agregar estudiante al curso
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
