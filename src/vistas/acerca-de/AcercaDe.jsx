
import { useState } from 'react';
import { useEncabezadoPagina } from '../../contexto/useEncabezadoPagina';
import './acerca-de.css';

// Videos explicativos organizados por rol.
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

// Categorías disponibles en la aplicación.
const CATEGORIAS = [
  { id: 'general', nombre: 'Introducción' },
  { id: 'estudiante', nombre: 'Estudiante' },
  { id: 'docente', nombre: 'Docente' },
];

export function AcercaDe({ rol }) {
  const [categoria, setCategoria] = useState('general');
  const [seleccionado, setSeleccionado] = useState('inicio');

  useEncabezadoPagina(
    'About A Walking Dictionary',
    'Tutoriales y demostraciones de la plataforma'
  );

  // Cada usuario puede ver la introducción y
  // los tutoriales correspondientes a su rol.
 const categoriasVisibles = CATEGORIAS.filter(
  (item) =>
    item.id === 'general' ||
    rol === 'docente' ||
    item.id === rol
);

  // Solo se incluyen los videos de la categoría
  // seleccionada y autorizada para el rol.
const videosVisibles = VIDEOS.filter(
  (video) =>
    video.rol === categoria &&
    (
      video.rol === 'general' ||
      rol === 'docente' ||
      video.rol === rol
    )
);

  // Video seleccionado, siempre que pertenezca
  // a una categoría permitida para el usuario.
  const videoActual = videosVisibles.find(
    (video) => video.id === seleccionado
  ) ?? videosVisibles[0];

  // Cambia la categoría y selecciona su primer video.
  function cambiarCategoria(nuevaCategoria) {
    const permitida = categoriasVisibles.some(
      (item) => item.id === nuevaCategoria
    );

    if (!permitida) return;

    const primero = VIDEOS.find(
      (video) => video.rol === nuevaCategoria
    );

    setCategoria(nuevaCategoria);
    setSeleccionado(primero?.id ?? 'inicio');
  }

  // Construye la URL de los videos almacenados en public.
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
          Selecciona una categoría y elige el tutorial
          que deseas consultar.
        </p>
      </section>

      {/* Categorías visibles según el rol */}
      <div
        className="acerca__categorias"
        aria-label="Categorías de tutoriales"
      >
        {categoriasVisibles.map((item) => (
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

      {/* Reproductor y listado de tutoriales */}
      <div
        className={`acerca__contenido ${
          categoria === 'general'
            ? 'acerca__contenido--completo'
            : ''
        }`}
      >
        {/* En introducción no se muestra el listado lateral */}
        {categoria !== 'general' && (
          <aside className="acerca__lista">
            <h3>Videos disponibles</h3>

            {videosVisibles.map((video) => (
              <button
                key={video.id}
                type="button"
                className={
                  videoActual?.id === video.id
                    ? 'acerca__item acerca__item--activo'
                    : 'acerca__item'
                }
                aria-pressed={videoActual?.id === video.id}
                onClick={() => setSeleccionado(video.id)}
              >
                <span aria-hidden="true">▶</span>
                {video.titulo}
              </button>
            ))}
          </aside>
        )}

        {/* Video y descripción técnica */}
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
