
import { useEffect, useState } from 'react';
import { obtenerFamiliaPalabras } from '../../../cliente-api/enriquecimientoApi';
import './sugerencias-palabras.css';

export default function SugerenciasPalabras({ palabra }) {
  const [sugerencias, setSugerencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const palabraActual = palabra?.trim();

    if (!palabraActual) {
      setSugerencias([]);
      setError('');
      setCargando(false);
      return;
    }

    let cancelado = false;

    async function cargarSugerencias() {
      setCargando(true);
      setError('');
      setSugerencias([]);

      try {
        const respuesta =
          await obtenerFamiliaPalabras(palabraActual);

        if (cancelado) return;

        const lista = Array.isArray(respuesta?.sugerencias)
          ? respuesta.sugerencias
          : [];

        // WordNet puede devolver términos como texto u objetos.
        const palabras = lista
          .map((item) => {
            if (typeof item === 'string') {
              return item.trim();
            }

            if (item && typeof item === 'object') {
              return String(
                item.palabra ??
                item.word ??
                item.lemma ??
                item.termino ??
                ''
              ).trim();
            }

            return '';
          })
          .filter(Boolean)
          .filter(
            (termino) =>
              termino.toLowerCase() !==
              palabraActual.toLowerCase()
          );

        setSugerencias(
          [...new Set(palabras.map((p) => p.toLowerCase()))]
            .map((normalizada) =>
              palabras.find(
                (p) => p.toLowerCase() === normalizada
              )
            )
        );
      } catch {
        if (!cancelado) {
          setError(
            'No fue posible cargar las sugerencias. Inténtalo nuevamente.'
          );
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargarSugerencias();

    return () => {
      cancelado = true;
    };
  }, [palabra]);

  if (!palabra?.trim()) return null;

  return (
    <section
      className="sugerencias-palabras"
      aria-labelledby="titulo-sugerencias"
    >
      <div className="sugerencias-palabras__encabezado">
        <span
          className="sugerencias-palabras__icono"
          aria-hidden="true"
        >
          ✦
        </span>

        <div>
          <h3 id="titulo-sugerencias">
            Explora palabras relacionadas
          </h3>
          <p>
            Amplía tu vocabulario a partir de «{palabra.trim()}».
          </p>
        </div>
      </div>

      {cargando && (
        <p className="sugerencias-palabras__estado" role="status">
          Buscando palabras relacionadas…
        </p>
      )}

      {!cargando && error && (
        <p className="sugerencias-palabras__error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && sugerencias.length === 0 && (
        <p className="sugerencias-palabras__vacio">
          No hay sugerencias disponibles para esta palabra.
        </p>
      )}

      {!cargando && !error && sugerencias.length > 0 && (
        <>
          <div className="sugerencias-palabras__lista">
            {sugerencias.map((termino) => (
              <span
                className="sugerencias-palabras__etiqueta"
                key={termino.toLowerCase()}
              >
                {termino}
              </span>
            ))}
          </div>

          <p className="sugerencias-palabras__nota">
            Las sugerencias son una ayuda para explorar el léxico;
            revisa su significado en el contexto de la lectura.
          </p>
        </>
      )}
    </section>
  );
}
