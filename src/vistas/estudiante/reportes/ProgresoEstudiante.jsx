
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../../contexto/useAuth';
import { useEncabezadoPagina } from '../../../contexto/useEncabezadoPagina';
import { BotonExportarPdf } from '../../../componentes/comunes/BotonExportarPdf';
import { exportarProgresoEstudiantePdf } from '../../../cliente-api/reportesApi';

import './progreso-estudiante.css';

export function ProgresoEstudiante() {
  const { t } = useTranslation();
  const { estudianteId } = useAuth();

  useEncabezadoPagina(
    t('studentProgress.title'),
    t('studentProgress.subtitle')
  );

  return (
    <section className="progreso-estudiante">
      <div className="progreso-estudiante__card">

        <div className="progreso-estudiante__header">
          <div className="progreso-estudiante__icono">
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
              <strong>Vocabulary</strong>
              <small>{t('studentProgress.words')}</small>
            </div>

            <div className="progreso-estudiante__item">
              <span className="progreso-estudiante__item-icono">
                02
              </span>
              <strong>Quiz Results</strong>
              <small>{t('studentProgress.quizzes')}</small>
            </div>

            <div className="progreso-estudiante__item">
              <span className="progreso-estudiante__item-icono">
                03
              </span>
              <strong>Study Progress</strong>
              <small>{t('studentProgress.study')}</small>
            </div>
          </div>

          <div className="progreso-estudiante__acciones">
            <BotonExportarPdf
              etiqueta={t('studentProgress.download')}
              disabled={!estudianteId}
              onExportar={() =>
                exportarProgresoEstudiantePdf(estudianteId)
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
