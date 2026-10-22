
import { useEffect, useState } from 'react';
import { obtenerFamiliaPalabras } from '../../cliente-api/enriquecimientoApi';
import './EnriquecimientoDiccionario.css';

const CATEGORIAS = [
  ['sustantivos', 'Nouns'],
  ['verbos', 'Verbs'],
  ['adjetivos', 'Adjectives'],
  ['adverbios', 'Adverbs'],
];

const RELACIONES = [
  ['sinonimos', 'Synonyms'],
  ['familia', 'Word Family'],
  ['hiperonimos', 'Hypernyms'],
  ['hiponimos', 'Hyponyms'],
];



function RelationGroup({ title, words }) {
  if (!Array.isArray(words) || words.length === 0) {
    return null;
  }

  return (
    <section className="wordnet-relation-box">
      <h5 className="wordnet-relation-box__title">
        {title}
      </h5>

      <div className="wordnet-relation-box__content">
        {[...new Set(words)].map((item) => (
          <span
            key={item}
            className="wordnet-relation-box__tag"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}



export function EnriquecimientoDiccionario({ palabra }) {
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [consultado, setConsultado] = useState(false);

  useEffect(() => {
    setResultado(null);
    setCargando(false);
    setError('');
    setConsultado(false);
  }, [palabra]);

  async function consultarWordNet() {
    if (!palabra?.trim() || cargando) return;

    setCargando(true);
    setError('');
    setConsultado(true);

    try {
      const respuesta = await obtenerFamiliaPalabras(palabra);

      setResultado(respuesta);
    } catch {
      setError('Unable to load WordNet suggestions.');
    } finally {
      setCargando(false);
    }
  }

  const sugerencias = resultado?.sugerencias || {};

  const categoriasDisponibles = CATEGORIAS.filter(([clave]) => {
    const categoria = sugerencias[clave];

    return categoria && RELACIONES.some(
      ([relacion]) =>
        Array.isArray(categoria[relacion]) &&
        categoria[relacion].length > 0
    );
  });

  return (
    <section className="global-dictionary__lexical-enrichment">
      <div className="global-dictionary__enrichment-heading">
        <div>
          <h3>Lexical Enrichment</h3>
          <p>Discover related vocabulary using WordNet 3.1.</p>
        </div>

        {!consultado && (
          <button
            type="button"
            onClick={consultarWordNet}
            disabled={!palabra}
            className="global-dictionary__load-enrichment"
          >
            Explore WordNet
          </button>
        )}
      </div>

      {cargando && (
        <p role="status">Loading lexical relationships...</p>
      )}

      {error && (
        <div>
          <p role="alert">{error}</p>
          <button type="button" onClick={consultarWordNet}>
            Try Again
          </button>
        </div>
      )}

      {consultado && !cargando && !error &&
        categoriasDisponibles.length === 0 && (
          <p>No lexical relationships were found for this word.</p>
        )}

      {!cargando && !error && categoriasDisponibles.map(
        ([clave, etiqueta]) => {
          const datos = sugerencias[clave];

          return (
            <section
              key={clave}
              className="global-dictionary__pos-section"
            >
              <h4>{etiqueta}</h4>

              <div className="global-dictionary__relations-grid">
                {RELACIONES.map(([relacion, titulo]) => (
                  <RelationGroup
                    key={relacion}
                    title={titulo}
                    words={datos[relacion]}
                  />
                ))}
              </div>
            </section>
          );
        }
      )}

      {resultado?.fuente && (
        <p className="global-dictionary__wordnet-source">
          Source: {resultado.fuente}
        </p>
      )}
    </section>
  );
}
