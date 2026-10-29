/**
 * @file DiccionarioGlobal.jsx
 * @brief Diccionario Global (HU-016): vocabulario aprobado con búsqueda, filtro por letra y detalle de cada palabra.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  listarDiccionario,
  obtenerDetallePalabra,
} from '../../cliente-api/diccionarioApi';
import './DiccionarioGlobal.css';
import { EnriquecimientoDiccionario } from './EnriquecimientoDiccionario';


/** @brief Letras del filtro alfabético. */
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * @brief Devuelve el valor como texto, o el texto de respaldo si viene vacío.
 * @param {*} value - Valor a mostrar.
 * @param {string} [fallback] - Texto si el valor es null, undefined o vacío.
 * @return {string}
 */
function textOrFallback(value, fallback = 'Not available') {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}





/** @brief Nombre en inglés de cada tipo de etiqueta de contexto. */
const CONTEXT_TYPES = {
  registro: 'Register',
  variante_regional: 'Regional Variant',
  categoria_gramatical: 'Part of Speech',
  ambito: 'Field',
  contexto: 'Context',
};

/** @brief Traducción al inglés de los valores de contexto guardados en español. */
const CONTEXT_VALUES = {
  informal: 'Informal',
  formal: 'Formal',
  academico: 'Academic',
  académico: 'Academic',
  literario: 'Literary',
  britanico: 'British',
  británico: 'British',
  estadounidense: 'American',
  americano: 'American',
  nigeriano: 'Nigerian',
  australiano: 'Australian',
  canadiense: 'Canadian',
  sustantivo: 'Noun',
  verbo: 'Verb',
  adjetivo: 'Adjective',
  adverbio: 'Adverb',
};

/**
 * @brief Normaliza un texto para buscarlo en CONTEXT_TYPES o CONTEXT_VALUES
 * (minúsculas y sin tildes).
 * @param {*} value - Texto a normalizar.
 * @return {string}
 */
function normalizeContextKey(value) {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * @brief Arma el texto de una etiqueta de contexto, por ejemplo "Register: Formal".
 * @param {{tipo?: string, valor?: string}} tag - Etiqueta de contexto de la tarjeta.
 * @return {string}
 */
function formatContextTag(tag) {
  const rawType = textOrFallback(tag?.tipo, 'Context');
  const rawValue = textOrFallback(tag?.valor, '');

  const typeKey = normalizeContextKey(rawType);
  const valueKey = normalizeContextKey(rawValue);

  const type =
    CONTEXT_TYPES[typeKey] ||
    rawType.replace(/_/g, ' ');

  const value =
    CONTEXT_VALUES[valueKey] ||
    rawValue.replace(/_/g, ' ');

  return rawValue ? `${type}: ${value}` : type;
}



/**
 * @brief Tarjeta de una palabra en la cuadrícula del diccionario.
 * @param {Object} props
 * @param {Object} props.word - Palabra aprobada.
 * @param {number} props.colorIndex - Índice del color de la tarjeta.
 * @param {Function} props.onViewDetails - Abre el detalle de la palabra.
 * @return {JSX.Element}
 */
function WordCard({ word, colorIndex, onViewDetails }) {
  const previewContext = Array.isArray(word.contexto)
    ? word.contexto.slice(0, 3)
    : [];

  return (
    <article
      className={`global-dictionary__card global-dictionary__card--${colorIndex % 3}`}
    >
      <div className="global-dictionary__card-heading">
        <span className="global-dictionary__badge">
          APPROVED VOCABULARY
        </span>

        {word.semana != null && (
          <span className="global-dictionary__week">
            WEEK {word.semana}
          </span>
        )}
      </div>

      <h3>{textOrFallback(word.palabra, 'Untitled word')}</h3>

      <p className="global-dictionary__translation">
        {textOrFallback(word.traduccion, 'No translation available')}
      </p>

      <div className="global-dictionary__separator" />

      <p className="global-dictionary__definition">
        {textOrFallback(word.definicion, 'No definition available')}
      </p>

      {word.ejemplo && (
        <blockquote className="global-dictionary__example">
          “{word.ejemplo}”
        </blockquote>
      )}

      {previewContext.length > 0 && (
        <div className="global-dictionary__mini-section">
          <p className="global-dictionary__mini-title">Context</p>
          <div className="global-dictionary__mini-tags">
            {previewContext.map((tag, index) => (
              <span key={tag.id_etiqueta ?? index}>
                {formatContextTag(tag)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="global-dictionary__card-footer">
        <span title={word.nombre_lectura || ''}>
          {textOrFallback(word.nombre_lectura, 'Unknown reading')}
        </span>

        <button
          type="button"
          onClick={() => onViewDetails(word.id_tarjeta)}
        >
          View Details <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  );
}



/**
 * @brief Panel con el detalle de una palabra; se cierra con Escape o con el botón de cerrar.
 * @param {Object} props
 * @param {Object|null} props.word - Detalle de la palabra.
 * @param {boolean} props.loading - Si el detalle se está cargando.
 * @param {string} props.error - Mensaje de error, vacío si no hay.
 * @param {Function} props.onClose - Cierra el panel.
 * @return {JSX.Element}
 */
function WordDetails({
  word,
  loading,
  error,
  onClose,
}) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  
  return (
    <div
      className="global-dictionary__overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="global-dictionary__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dictionary-detail-title"
      >
        <header className="global-dictionary__dialog-header">
          <span>GLOBAL DICTIONARY / WORD DETAILS</span>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close word details"
          >
            ×
          </button>
        </header>

        <div className="global-dictionary__dialog-content">
          <h2
            id="dictionary-detail-title"
            className="global-dictionary__sr-only"
          >
            Word Details
          </h2>

          {loading && (
            <p role="status">Loading word details...</p>
          )}

          {error && (
            <p role="alert" className="global-dictionary__error">
              {error}
            </p>
          )}

          {word && !loading && (
            <>
              <h2 className="global-dictionary__dialog-word">
                {textOrFallback(word.palabra, 'Untitled word')}
              </h2>

              <div className="global-dictionary__detail-translation">
                {textOrFallback(
                  word.traduccion,
                  'No translation available'
                )}
              </div>

              <div className="global-dictionary__separator" />

              <section className="global-dictionary__detail-section">
                <h3>Definition</h3>
                <p>
                  {textOrFallback(
                    word.definicion,
                    'No definition available'
                  )}
                </p>
              </section>

              <section className="global-dictionary__detail-section">
                <h3>Example</h3>
                {word.ejemplo ? (
                  <blockquote className="global-dictionary__example">
                    “{word.ejemplo}”
                  </blockquote>
                ) : (
                  <p>No example available.</p>
                )}
              </section>

              <section className="global-dictionary__detail-section">
                <h3>Context</h3>
                {Array.isArray(word.contexto) && word.contexto.length > 0 ? (
                  <div className="global-dictionary__tags">
                    {word.contexto.map((tag, index) => (
                      <span key={tag.id_etiqueta ?? index}>
                        {formatContextTag(tag)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No context tags available.</p>
                )}
              </section>

              <section className="global-dictionary__detail-section">
                <h3>Source Reading</h3>
                <p>
                  {textOrFallback(
                    word.nombre_lectura,
                    'Not specified'
                  )}
                </p>

                {word.autor_lectura && (
                  <p>
                    <strong>Author:</strong> {word.autor_lectura}
                  </p>
                )}

                {word.semana != null && (
                  <p>
                    <strong>Week:</strong> {word.semana}
                  </p>
                )}
              </section>

              <EnriquecimientoDiccionario palabra={word.palabra} />
            </>
          )}
        </div>

        <footer className="global-dictionary__dialog-footer">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}

/**
 * @brief Pantalla del Diccionario Global, compartida por los tres roles.
 * @return {JSX.Element}
 */
export function DiccionarioGlobal() {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const previousFocusRef = useRef(null);
  const detailRequestRef = useRef(0);

  useEffect(() => {
    let active = true;

    async function loadVocabulary() {
      setLoading(true);
      setError('');

      try {
        const data = await listarDiccionario(searchTerm);

        if (active) {
          setWords(data);
        }
      } catch {
        if (active) {
          setWords([]);
          setError('Unable to load the dictionary. Please try again.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadVocabulary();

    return () => {
      active = false;
    };
  }, [searchTerm]);

  const visibleWords = useMemo(() => {
    if (selectedLetter === 'ALL') return words;

    return words.filter((word) =>
      String(word.palabra || '')
        .toUpperCase()
        .startsWith(selectedLetter)
    );
  }, [words, selectedLetter]);

  /**
   * @brief Aplica el texto de búsqueda y quita el filtro por letra.
   * @param {SubmitEvent} event - Evento submit del formulario de búsqueda.
   */
  function handleSearch(event) {
    event.preventDefault();
    setSelectedLetter('ALL');
    setSearchTerm(searchInput.trim());
  }

  /** @brief Limpia la búsqueda y el filtro por letra. */
  function clearFilters() {
    setSearchInput('');
    setSearchTerm('');
    setSelectedLetter('ALL');
  }

  /**
   * @brief Abre el detalle de una palabra y lo consulta; ignora respuestas de consultas viejas.
   * @param {number} idTarjeta - Id de la tarjeta.
   */
  async function viewDetails(idTarjeta) {
    if (idTarjeta == null) return;

    previousFocusRef.current = document.activeElement;
    const requestId = ++detailRequestRef.current;

    setDetailsOpen(true);
    setSelectedWord(null);
    setDetailsError('');
    setDetailsLoading(true);

    try {
      const data = await obtenerDetallePalabra(idTarjeta);

      if (requestId === detailRequestRef.current) {
        setSelectedWord(data);
      }
    } catch {
      if (requestId === detailRequestRef.current) {
        setDetailsError(
          'Unable to load word details. Please try again.'
        );
      }
    } finally {
      if (requestId === detailRequestRef.current) {
        setDetailsLoading(false);
      }
    }
  }

  /** @brief Cierra el detalle y devuelve el foco al elemento que lo abrió. */
  function closeDetails() {
    ++detailRequestRef.current;
    setDetailsOpen(false);
    setSelectedWord(null);
    setDetailsError('');
    setDetailsLoading(false);

    requestAnimationFrame(() => {
      previousFocusRef.current?.focus?.();
    });
  }

  return (
    <main className="global-dictionary">
      <header className="global-dictionary__intro">
        <p className="global-dictionary__eyebrow">
          LEXICAL REPOSITORY
        </p>

        <h1>Global Dictionary</h1>

        <p>
          Explore approved vocabulary collected from different study decks
          throughout the semester.
        </p>
      </header>

      <form
        role="search"
        className="global-dictionary__search"
        onSubmit={handleSearch}
      >
        <label
          htmlFor="global-dictionary-search"
          className="global-dictionary__sr-only"
        >
          Search vocabulary
        </label>

        <input
          id="global-dictionary-search"
          type="search"
          placeholder="Search for a word or part of it..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      <nav
        className="global-dictionary__alphabet"
        aria-label="Filter vocabulary by first letter"
      >
        <button
          type="button"
          className={selectedLetter === 'ALL' ? 'active' : ''}
          aria-pressed={selectedLetter === 'ALL'}
          onClick={() => setSelectedLetter('ALL')}
        >
          ALL
        </button>

        {LETTERS.map((letter) => (
          <button
            key={letter}
            type="button"
            className={selectedLetter === letter ? 'active' : ''}
            aria-pressed={selectedLetter === letter}
            onClick={() => setSelectedLetter(letter)}
          >
            {letter}
          </button>
        ))}
      </nav>

      <div className="global-dictionary__results-header">
        <div>
          <h2>Approved Vocabulary</h2>
          {!loading && !error && (
            <p aria-live="polite">
              {visibleWords.length}{' '}
              {visibleWords.length === 1 ? 'word found' : 'words found'}
            </p>
          )}
        </div>

        <button
          className="global-dictionary__clear"
          type="button"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      {loading && (
        <p role="status" className="global-dictionary__status">
          Loading vocabulary...
        </p>
      )}

      {!loading && error && (
        <p
          role="alert"
          className="global-dictionary__status global-dictionary__error"
        >
          {error}
        </p>
      )}

      {!loading && !error && visibleWords.length === 0 && (
        <section className="global-dictionary__empty" role="status">
          <h3>No matching words found</h3>

          <p>
            {selectedLetter !== 'ALL'
              ? `No words starting with "${selectedLetter}" were found.`
              : searchTerm
                ? `No approved vocabulary matches "${searchTerm}". Try another search.`
                : 'No approved vocabulary is available yet.'}
          </p>
        </section>
      )}

      {!loading && !error && visibleWords.length > 0 && (
        <section
          className="global-dictionary__grid"
          aria-label="Approved vocabulary"
        >
          {visibleWords.map((word, index) => (
            <WordCard
              key={word.id_tarjeta}
              word={word}
              colorIndex={index}
              onViewDetails={viewDetails}
            />
          ))}
        </section>
      )}

      {detailsOpen && (
        <WordDetails
          word={selectedWord}
          loading={detailsLoading}
          error={detailsError}
          onClose={closeDetails}
        />
      )}
    </main>
  );
}