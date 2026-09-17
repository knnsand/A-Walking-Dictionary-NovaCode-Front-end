import { useEffect, useState } from 'react';

import { listarCursos } from '../../../cliente-api/cursosApi';

import { ModalInscribirEstudiante } from '../inscribir-estudiante/ModalInscribirEstudiante';

export function CursosEstudiantes() {
  const [cursos, setCursos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    listarCursos().then(setCursos);
  }, []);

  return (
    <div className="card-mazo">
      <div className="card-mazo__header">
        <div className="card-mazo__icon" aria-hidden="true" />
        <div>
          <h2 className="card-mazo__title">
            Cursos Académicos y Cohortes
          </h2>
          <p className="card-mazo__subtitle">
            Administra tus cursos y estudiantes inscritos.
          </p>
        </div>
      </div>

      <div className="card-mazo__body">
        {cursos.length === 0 ? (
          <p className="empty-state">
            Todavía no hay cursos registrados.
          </p>
        ) : (
          <ul className="mazo-list">
            {cursos.map((curso) => (
              <li className="mazo-list__item" key={curso.id_curso}>
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
                  <strong>LIT2026</strong>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setMostrarFormulario(true)}
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
    </div>
  );
}