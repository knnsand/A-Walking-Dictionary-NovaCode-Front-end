/** Tutoriales de la plataforma, filtrados según el rol. */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEncabezadoPagina } from '../../contexto/useEncabezadoPagina';
import './acerca-de.css';

const VIDEOS = [
  { id: 'inicio', rol: 'general', archivo: 'Estudiante/IniciodeSesion.mp4.mp4' },
  { id: 'perfil-reportes', rol: 'estudiante', archivo: 'Estudiante/PerfilAcademico_ReportesProgresoyModoEstudio.mp4.mp4' },
  { id: 'palabras-estudio', rol: 'estudiante', archivo: 'Estudiante/RegistrarPalabra_ModoEstudio.mp4.mp4' },
  { id: 'diccionario-mazos', rol: 'estudiante', archivo: 'Estudiante/DiccionarioGlobal_MazosdeEstudio.mp4.mp4' },
  { id: 'quices-estudiante', rol: 'estudiante', archivo: 'Estudiante/ResolucionQuices.mp4.mp4' },
  { id: 'mazos-analiticas', rol: 'docente', archivo: 'Docente/CreacionMazo_ AnaliticasParticipacion.mp4.mp4' },
  { id: 'quices-docente', rol: 'docente', archivo: 'Docente/Generacion_ExportacionQuices.mp4.mp4' },
];

const CATEGORIAS = [
  { id: 'general', labelKey: 'aboutPage.categories.introduction' },
  { id: 'estudiante', labelKey: 'aboutPage.categories.student' },
  { id: 'docente', labelKey: 'aboutPage.categories.teacher' },
];

export function AcercaDe({ rol }) {
  const { t } = useTranslation();
  const [categoria, setCategoria] = useState('general');
  const [seleccionado, setSeleccionado] = useState('inicio');

  useEncabezadoPagina(t('aboutPage.title'), t('aboutPage.subtitle'));

  const categoriasVisibles = CATEGORIAS.filter(
    (item) => item.id === 'general' || rol === 'docente' || item.id === rol
  );
  const videosVisibles = VIDEOS.filter((video) => video.rol === categoria);
  const videoActual = videosVisibles.find((video) => video.id === seleccionado) ?? videosVisibles[0];

  function cambiarCategoria(nuevaCategoria) {
    if (!categoriasVisibles.some((item) => item.id === nuevaCategoria)) return;
    setCategoria(nuevaCategoria);
    setSeleccionado(VIDEOS.find((video) => video.rol === nuevaCategoria)?.id ?? 'inicio');
  }

  function obtenerRuta(archivo) {
    return encodeURI(`${import.meta.env.BASE_URL}VideosExplicativos/${archivo}`);
  }

  return (
    <main className="acerca">
      <div className="acerca__categorias" role="group" aria-label={t('aboutPage.title')}>
        {categoriasVisibles.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`acerca__categoria btn ${categoria === item.id ? 'btn-primary acerca__categoria--activa' : 'btn-secondary'}`}
            aria-pressed={categoria === item.id}
            onClick={() => cambiarCategoria(item.id)}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      <div className={`acerca__contenido ${categoria === 'general' ? 'acerca__contenido--completo' : ''}`}>
        {categoria !== 'general' && (
          <aside className="acerca__lista">
            <h2>{t('aboutPage.availableVideos')}</h2>
            {videosVisibles.map((video) => (
              <button
                key={video.id}
                type="button"
                className={`acerca__item ${videoActual?.id === video.id ? 'acerca__item--activo' : ''}`}
                aria-pressed={videoActual?.id === video.id}
                onClick={() => setSeleccionado(video.id)}
              >
                <span aria-hidden="true">▶</span>
                {t(`aboutPage.tutorials.${video.id}.title`)}
              </button>
            ))}
          </aside>
        )}

        {videoActual && (
          <section className="acerca__detalle">
            <h2>{t(`aboutPage.tutorials.${videoActual.id}.title`)}</h2>
            <video key={videoActual.id} controls playsInline preload="metadata" className="acerca__video">
              <source src={obtenerRuta(videoActual.archivo)} type="video/mp4" />
              {t('aboutPage.videoUnsupported')}
            </video>
            <div className="acerca__descripcion">
              <h3>{t('aboutPage.featureDescription')}</h3>
              <p>{t(`aboutPage.tutorials.${videoActual.id}.description`)}</p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
