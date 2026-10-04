import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { obtenerCurso, listarEstudiantesCurso } from '../../../cliente-api/cursosApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';

import './detalle-curso.css';

export function DetalleCurso() {
  const { id } = useParams();
  const [curso, setCurso] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });

  useEncabezadoPagina(
    curso ? curso.nombre : 'Curso',
    'Estudiantes inscritos en este curso.'
  );

  useEffect(() => {
    let activo = true;
    setCargando(true);
    Promise.all([obtenerCurso(id), listarEstudiantesCurso(id)])
      .then(([cursoData, estudiantesData]) => {
        if (!activo) return;
        setCurso(cursoData);
        setEstudiantes(estudiantesData);
      })
      .catch((error) => {
        if (!activo) return;
        setAviso({
          tipo: 'error',
          mensaje: error.message || 'No se pudo cargar el curso.',
        });
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [id]);

  return (
    <div className="detalle-curso">
      <Link to=".." relative="path" className="detalle-curso__volver">
        ← Volver a cursos
      </Link>

      <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />

      {cargando ? (
        <p className="empty-state">Cargando estudiantes...</p>
      ) : estudiantes.length === 0 ? (
        <p className="empty-state">
          Este curso todavía no tiene estudiantes inscritos.
        </p>
      ) : (
        <div className="detalle-curso__tabla-contenedor">
          <table className="detalle-curso__tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Palabras aportadas</th>
                <th>Nivel de inglés</th>
                <th>Código estudiantil</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((est) => (
                <tr key={est.id_usuario}>
                  <td>{est.nombre_completo}</td>
                  <td>{est.palabras_aportadas}</td>
                  <td>{est.nivel_ingles || '—'}</td>
                  <td>{est.codigo_estudiantil || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
