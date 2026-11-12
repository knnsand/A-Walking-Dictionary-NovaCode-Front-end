
/** Detalle del curso: estudiantes y reportes PDF. También se puede insertar en CursosEstudiantes. */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { obtenerCurso, listarEstudiantesCurso } from '../../../cliente-api/cursosApi';
import {
  exportarProgresoEstudiantePdf,
  exportarReporteCursoPdf,
  exportarReporteModoEstudioPdf,
} from '../../../cliente-api/reportesApi';
import { BotonExportarPdf } from '../../../componentes/comunes/BotonExportarPdf';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';
import './detalle-curso.css';

export function DetalleCurso({ idCurso, integrado = false, version = 0 }) {
  const { t } = useTranslation();
  const { id: idRuta } = useParams();
  const id = idCurso ?? idRuta;

  const [curso, setCurso] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });

  // Mostrar el nombre en inglés sin modificar el valor almacenado.
  const nombreCurso =
    curso?.nombre === 'Literatura Anglófona'
      ? 'Anglophone Literature'
      : curso?.nombre;

  // Evitar que el detalle integrado sustituya el encabezado de Courses & Students.
  useEncabezadoPagina(
    integrado
      ? t('coursesPage.title')
      : (nombreCurso ?? t('courseDetail.titleFallback')),
    integrado
      ? t('coursesPage.subtitle')
      : t('courseDetail.subtitle')
  );

  useEffect(() => {
    let activo = true;

    setCargando(true);
    setAviso({ tipo: null, mensaje: null });

    Promise.all([obtenerCurso(id), listarEstudiantesCurso(id)])
      .then(([cursoData, estudiantesData]) => {
        if (!activo) return;

        setCurso(cursoData);
        setEstudiantes(estudiantesData);
      })
      .catch((error) => {
        if (activo) {
          setAviso({
            tipo: 'error',
            mensaje:
              error.message || t('courseDetail.errors.loadFailed'),
          });
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [id, t, version]);

  // Preparar el contenido sin operadores ternarios anidados.
  let contenidoCurso = null;

  if (cargando) {
    contenidoCurso = (
      <p className="empty-state">
        {t('courseDetail.loading')}
      </p>
    );
  } else if (curso) {
    contenidoCurso = (
      <>
        {/* Reportes PDF del curso */}
        <section
          className="detalle-curso__card detalle-curso__reports-card"
          aria-labelledby="detalle-curso-reportes-titulo"
        >
          <div className="detalle-curso__card-header">
            <h2 id="detalle-curso-reportes-titulo">
              {t('courseDetail.reportsTitle')}
            </h2>

            <p>{t('courseDetail.reportsSubtitle')}</p>
          </div>

          <div className="detalle-curso__reports-actions">
            <BotonExportarPdf
              etiqueta={t('courseDetail.exportCourseReport')}
              ariaLabel={t('courseDetail.exportReportFor', {
                name: nombreCurso,
              })}
              onExportar={() => exportarReporteCursoPdf(id)}
            />

            <BotonExportarPdf
              etiqueta={t('studyModeReport.downloadGeneral')}
              ariaLabel={t('studyModeReport.downloadGeneral')}
              onExportar={() => exportarReporteModoEstudioPdf()}
            />
          </div>

          <p className="detalle-curso__reports-note">
            {t('studyModeReport.generalScope')}
          </p>
        </section>

        {/* Lista de estudiantes matriculados */}
        <section
          className="detalle-curso__card detalle-curso__students-card"
          aria-labelledby="detalle-curso-estudiantes-titulo"
        >
          <div className="detalle-curso__card-header">
            <h2 id="detalle-curso-estudiantes-titulo">
              {t('courseDetail.studentsTitle')}
            </h2>
          </div>

          {estudiantes.length === 0 ? (
            <p className="empty-state">
              {t('courseDetail.empty')}
            </p>
          ) : (
            <div className="detalle-curso__tabla-contenedor">
              <table className="detalle-curso__tabla">
                <thead>
                  <tr>
                    <th scope="col">
                      {t('courseDetail.columns.name')}
                    </th>
                    <th scope="col">
                      {t('courseDetail.columns.words')}
                    </th>
                    <th scope="col">
                      {t('courseDetail.columns.level')}
                    </th>
                    <th scope="col">
                      {t('courseDetail.columns.code')}
                    </th>
                    <th scope="col">
                      {t('courseDetail.columns.progressReport')}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {estudiantes.map((est) => (
                    <tr key={est.id_usuario}>
                      <td>{est.nombre_completo}</td>

                      <td>{est.palabras_aportadas}</td>

                      <td>{est.nivel_ingles || '—'}</td>

                      <td>{est.codigo_estudiantil || '—'}</td>

                      <td className="detalle-curso__celda-reporte">
                        <div className="detalle-curso__reporte">
                          <BotonExportarPdf
                            etiqueta={t('courseDetail.downloadProgress')}
                            ariaLabel={t(
                              'courseDetail.downloadProgressFor',
                              { name: est.nombre_completo }
                            )}
                            disabled={!est.id_usuario}
                            onExportar={() =>
                              exportarProgresoEstudiantePdf(est.id_usuario)
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </>
    );
  }

  return (
    <div className="detalle-curso">
      {!integrado && (
        <Link
          to=".."
          relative="path"
          className="detalle-curso__volver"
        >
          {t('courseDetail.back')}
        </Link>
      )}

      <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />

      {contenidoCurso}
    </div>
  );
}
