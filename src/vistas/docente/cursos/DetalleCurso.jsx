/**
 * @file DetalleCurso.jsx
 * @brief Detalle de un curso: estudiantes inscritos, descarga del reporte de progreso de cada
 * uno (HU-018) y del reporte consolidado del curso (HU-020).
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { obtenerCurso, listarEstudiantesCurso } from '../../../cliente-api/cursosApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';

import './detalle-curso.css';
import { BotonExportarPdf } from '../../../componentes/comunes/BotonExportarPdf';
import {
  exportarProgresoEstudiantePdf,
  exportarReporteCursoPdf,
} from '../../../cliente-api/reportesApi';


/**
 * @brief Muestra la tabla de estudiantes del curso indicado en la URL (/docente/cursos/:id).
 * @return {JSX.Element}
 */
export function DetalleCurso() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [curso, setCurso] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });

  useEncabezadoPagina(
    curso ? curso.nombre : t('courseDetail.titleFallback'),
    t('courseDetail.subtitle')
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
        // error.message viene del backend y puede estar en español (pendiente de revisar).
        setAviso({
          tipo: 'error',
          mensaje: error.message || t('courseDetail.errors.loadFailed'),
        });
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [id, t]);

  return (
    <div className="detalle-curso">
      <Link to=".." relative="path" className="detalle-curso__volver">
        {t('courseDetail.back')}
      </Link>

      <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />

      {/* HU-020: reporte consolidado de todos los estudiantes del curso */}
      {!cargando && curso && (
        <div className="detalle-curso__acciones">
          <div className="detalle-curso__reporte">
            <BotonExportarPdf
              etiqueta={t('courseDetail.downloadCourseReport')}
              ariaLabel={t('courseDetail.downloadCourseReportFor', { name: curso.nombre })}
              onExportar={() => exportarReporteCursoPdf(id)}
            />
          </div>
        </div>
      )}

      {cargando ? (
        <p className="empty-state">{t('courseDetail.loading')}</p>
      ) : estudiantes.length === 0 ? (
        <p className="empty-state">
          {t('courseDetail.empty')}
        </p>
      ) : (
        <div className="detalle-curso__tabla-contenedor">
          <table className="detalle-curso__tabla">
            <thead>
              <tr>
                <th>{t('courseDetail.columns.name')}</th>
                <th>{t('courseDetail.columns.words')}</th>
                <th>{t('courseDetail.columns.level')}</th>
                <th>{t('courseDetail.columns.code')}</th>
                <th>{t('courseDetail.columns.progressReport')}</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((est) => (
                <tr key={est.id_usuario}>
                  <td>{est.nombre_completo}</td>
                  <td>{est.palabras_aportadas}</td>
                  <td>{est.nivel_ingles || '—'}</td>
                  <td>{est.codigo_estudiantil || '—'}</td>
                  {/* HU-018: descarga del reporte individual */}
                  
                <td className="detalle-curso__celda-reporte">
                  <div className="detalle-curso__reporte">
                    <BotonExportarPdf
                      etiqueta={t('courseDetail.downloadProgress')}
                      ariaLabel={t('courseDetail.downloadProgressFor', {
                        name: est.nombre_completo,
                      })}
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
    </div>
  );
}