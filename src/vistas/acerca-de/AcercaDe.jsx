
import { useState } from 'react';
import { useEncabezadoPagina } from '../../contexto/useEncabezadoPagina';
import './acerca-de.css';

// Los nombres coinciden con los archivos del ZIP.
const VIDEOS = [
  {
    id: 'inicio',
    rol: 'general',
    titulo: 'Acceso a la plataforma',
    archivo: 'Estudiante/IniciodeSesion.mp4.mp4',
    descripcion:
      'Presenta los mecanismos de autenticación y las opciones de acceso para estudiantes, docentes e invitados, según sus permisos dentro de la plataforma.',
  },
  {
    id: 'perfil-reportes',
    rol: 'estudiante',
    titulo: 'Perfil académico y reportes',
    archivo:
      'Estudiante/PerfilAcademico_ReportesProgresoyModoEstudio.mp4.mp4',
    descripcion:
      'Muestra la configuración de los datos académicos del estudiante, las validaciones del perfil y la consulta de reportes PDF de progreso y modo de estudio.',
  },
  {
    id: 'palabras-estudio',
    rol: 'estudiante',
    titulo: 'Registro de palabras y modo de estudio',
    archivo: 'Estudiante/RegistrarPalabra_ModoEstudio.mp4.mp4',
    descripcion:
      'Explica el registro de vocabulario en los mazos, las validaciones del formulario y la práctica mediante tarjetas interactivas y repetición espaciada.',
  },
  {
    id: 'diccionario-mazos',
    rol: 'estudiante',
    titulo: 'Diccionario Global y mazos de estudio',
    archivo:
      'Estudiante/DiccionarioGlobal_MazosdeEstudio.mp4.mp4',
    descripcion:
      'Permite consultar vocabulario aprobado mediante búsquedas y filtros, explorar los mazos académicos y acceder a relaciones semánticas mediante WordNet.',
  },
  {
    id: 'quices-estudiante',
    rol: 'estudiante',
    titulo: 'Resolución de quices',
    archivo: 'Estudiante/ResolucionQuices.mp4.mp4',
    descripcion:
      'Demuestra la resolución de evaluaciones de vocabulario, la selección de respuestas y la retroalimentación sobre los resultados obtenidos.',
  },
  {
    id: 'mazos-analiticas',
    rol: 'docente',
    titulo: 'Creación de mazos y analíticas',
    archivo:
      'Docente/CreacionMazo_ AnaliticasParticipacion.mp4.mp4',
    descripcion:
      'Muestra la configuración de mazos académicos, las validaciones de fechas y el seguimiento de contribuciones estudiantiles mediante indicadores de participación.',
  },
  {
    id: 'quices-docente',
    rol: 'docente',
    titulo: 'Generación y exportación de quices',
    archivo:
      'Docente/Generacion_ExportacionQuices.mp4.mp4',
    descripcion:
      'Explica la configuración de cuestionarios acumulativos, la selección de mazos, la programación de evaluaciones y su exportación en formato PDF.',
  },
];

const CATEGORIAS = [
  { id: 'general', nombre: 'Introducción' },
  { id: 'estudiante', nombre: 'Estudiante' },
  { id: 'docente', nombre: 'Docente' },
];

export function AcercaDe() {
  const [categoria, setCategoria] = useState('general');
  const [seleccionado, setSeleccionado] = useState('inicio');

  useEncabezadoPagina(
    'About A Walking Dictionary',
    'Tutoriales y demostraciones de la plataforma'
  );

  const videosVisibles = VIDEOS.filter(
    (video) => video.rol === categoria
  );

  const videoActual = VIDEOS.find(
    (video) => video.id === seleccionado
  );

  function cambiarCategoria(nuevaCategoria) {
    setCategoria(nuevaCategoria);

    const primero = VIDEOS.find(
      (video) => video.rol === nuevaCategoria
    );

    setSeleccionado(primero?.id ?? 'inicio');
  }

  function obtenerRuta(archivo) {
    return encodeURI(
      `${import.meta.env.BASE_URL}VideosExplicativos/${archivo}`
    );
  }

  return (
    <main className="acerca">
      <section className="acerca__intro">
        <h2>Aprende a utilizar A Walking Dictionary</h2>
        <p>
          Explora las funcionalidades de la plataforma
          mediante videos explicativos con narración y subtítulos.
          Selecciona un rol y elige el tutorial que deseas consultar.
        </p>
      </section>

      <div
        className="acerca__categorias"
        aria-label="Categorías de tutoriales"
      >
        {CATEGORIAS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              categoria === item.id
                ? 'acerca__categoria acerca__categoria--activa'
                : 'acerca__categoria'
            }
            aria-pressed={categoria === item.id}
            onClick={() => cambiarCategoria(item.id)}
          >
            {item.nombre}
          </button>
        ))}
      </div>

      <div className="acerca__contenido">
        <aside className="acerca__lista">
          <h3>Videos disponibles</h3>

          {videosVisibles.map((video) => (
            <button
              key={video.id}
              type="button"
              className={
                seleccionado === video.id
                  ? 'acerca__item acerca__item--activo'
                  : 'acerca__item'
              }
              aria-pressed={seleccionado === video.id}
              onClick={() => setSeleccionado(video.id)}
            >
              <span aria-hidden="true">▶</span>
              {video.titulo}
            </button>
          ))}
        </aside>

        {videoActual && (
          <section className="acerca__detalle">
            <h3>{videoActual.titulo}</h3>

            <video
              key={videoActual.id}
              controls
              playsInline
              preload="metadata"
              className="acerca__video"
            >
              <source
                src={obtenerRuta(videoActual.archivo)}
                type="video/mp4"
              />
              Tu navegador no permite reproducir este video.
            </video>

            <div className="acerca__descripcion">
              <h4>Descripción de la funcionalidad</h4>
              <p>{videoActual.descripcion}</p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
