
/**
 * @file ProgresoEstudiante.jsx
 * @brief Pantalla de reportes del estudiante:
 * HU-018: progreso individual.
 * HU-019: reporte del modo de estudio.
 */

import { useTranslation } from 'react-i18next';

import { useAuth } from '../../../contexto/useAuth';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';
import { BotonExportarPdf } from '../../../componentes/comunes/BotonExportarPdf';

import {
  exportarProgresoEstudiantePdf,
  exportarReporteModoEstudioPdf,
} from '../../../cliente-api/reportesApi';

import './progreso-estudiante.css';

/**
 * @brief Muestra los reportes disponibles para el estudiante
 * y permite descargarlos en formato PDF.
 * @return {JSX.Element}
 */
export function ProgresoEstudiante() {
  const { t } = useTranslation();
  const { estudianteId } = useAuth();

  useEncabezadoPagina(
    t('studentProgress.title'),
    t('studentProgress.subtitle')
  );

  return (
    <section className="progreso-estudiante">

      {/* =========================================
          HU-018: REPORTE DE PROGRESO INDIVIDUAL
          ========================================= */}
      <article className="progreso-estudiante__card">

        <div className="progreso-estudiante__header">
          <div
            className="progreso-estudiante__icono"
            aria-hidden="true"
          >
            PDF
          </div>

          <div>
            <h2>{t('studentProgress.heading')}</h2>
            <p>{t('studentProgress.reportSubtitle')}</p>
          </div>
        </div>

        <div className="progreso-estudiante__body">
          <p className="progreso-estudiante__descripcion">
            {t('studentProgress.description')}
          </p>

          <div className="progreso-estudiante__items">

            <div className="progreso-estudiante__item">
              <span className="progreso-estudiante__item-icono">
                01
              </span>
              <strong>
                {t('studentProgress.wordsTitle')}
              </strong>
              <small>
                {t('studentProgress.words')}
              </small>
            </div>

            <div className="progreso-estudiante__item">
              <span className="progreso-estudiante__item-icono">
                02
              </span>
              <strong>
                {t('studentProgress.quizzesTitle')}
              </strong>
              <small>
                {t('studentProgress.quizzes')}
              </small>
            </div>

            <div className="progreso-estudiante__item">
              <span className="progreso-estudiante__item-icono">
                03
              </span>
              <strong>
                {t('studentProgress.studyTitle')}
              </strong>
              <small>
                {t('studentProgress.study')}
              </small>
            </div>

          </div>

          <div className="progreso-estudiante__acciones">
            <BotonExportarPdf
              etiqueta={t('studentProgress.download')}
              ariaLabel={t('studentProgress.download')}
              disabled={!estudianteId}
              onExportar={() =>
                exportarProgresoEstudiantePdf(estudianteId)
              }
            />
          </div>
        </div>
      </article>

      {/* =========================================
          HU-019: REPORTE DEL MODO DE ESTUDIO
          ========================================= */}
      <article className="progreso-estudiante__card">

        <div className="progreso-estudiante__header">
          <div
            className="progreso-estudiante__icono"
            aria-hidden="true"
          >
            PDF
          </div>

          <div>
            <h2>{t('studyModeReport.ownTitle')}</h2>
            <p>{t('studyModeReport.ownSubtitle')}</p>
          </div>
        </div>

        <div className="progreso-estudiante__body">
          <p className="progreso-estudiante__descripcion">
            {t('studyModeReport.ownDescription')}
          </p>

          <div className="progreso-estudiante__items">

            <div className="progreso-estudiante__item">
              <span className="progreso-estudiante__item-icono">
                01
              </span>
              <strong>
                {t('studyModeReport.reviewSummaryTitle')}
              </strong>
              <small>
                {t('studyModeReport.reviewSummary')}
              </small>
            </div>

            <div className="progreso-estudiante__item">
              <span className="progreso-estudiante__item-icono">
                02
              </span>
              <strong>
                {t('studyModeReport.ratingsTitle')}
              </strong>
              <small>
                {t('studyModeReport.ratings')}
              </small>
            </div>

            <div className="progreso-estudiante__item">
              <span className="progreso-estudiante__item-icono">
                03
              </span>
              <strong>
                {t('studyModeReport.difficultWordsTitle')}
              </strong>
              <small>
                {t('studyModeReport.difficultWords')}
              </small>
            </div>

          </div>

          <div className="progreso-estudiante__acciones">
            <BotonExportarPdf
              etiqueta={t('studyModeReport.downloadOwn')}
              ariaLabel={t('studyModeReport.downloadOwn')}
              disabled={!estudianteId}
              onExportar={() =>
                exportarReporteModoEstudioPdf(estudianteId)
              }
            />
          </div>
        </div>
      </article>

    </section>
  );
}
