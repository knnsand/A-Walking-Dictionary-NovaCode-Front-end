/**
 * @file SugerenciasPalabras.jsx
 * @brief Sugerencias de palabras relacionadas (WordNet) en el dorso de la flashcard (HU-011).
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { obtenerFamiliaPalabras } from '../../../cliente-api/enriquecimientoApi';
import './sugerencias-palabras.css';

/**
 * @brief El backend agrupa por categoría gramatical (sustantivos, verbos, adjetivos, adverbios).
 * Aquí se aplana todo en una sola lista de términos.
 * @param {Array|Object} sugerencias - Sugerencias tal como las devuelve el backend.
 * @return {string[]}
 */
function aplanarSugerencias(sugerencias) {
  if (Array.isArray(sugerencias)) return sugerencias;
  if (!sugerencias || typeof sugerencias !== 'object') return [];

  return Object.values(sugerencias).flatMap((categoria) => [
    ...(categoria?.sinonimos ?? []),
    ...(categoria?.familia ?? []),
    ...(categoria?.hiperonimos ?? []),
    ...(categoria?.hiponimos ?? []),
  ]);
}

/**
 * @brief Consulta y muestra las sugerencias de WordNet para la palabra de la tarjeta.
 * @param {Object} props
 * @param {string} props.palabra - Palabra de la tarjeta.
 * @return {JSX.Element|null}
 */
export default function SugerenciasPalabras({ palabra }) {
  const { t } = useTranslation();
  const [sugerencias, setSugerencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [hayError, setHayError] = useState(false);

  useEffect(() => {
    const palabraActual = palabra?.trim();

    if (!palabraActual) {
      setSugerencias([]);
      setHayError(false);
      setCargando(false);
      return;
    }

    let cancelado = false;

    async function cargarSugerencias() {
      setCargando(true);
      setHayError(false);
      setSugerencias([]);

      try {
        const respuesta =
          await obtenerFamiliaPalabras(palabraActual);

        if (cancelado) return;

        const lista = aplanarSugerencias(respuesta?.sugerencias);

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
            .slice(0, 10)
        );
      } catch {
        if (!cancelado) setHayError(true);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    void cargarSugerencias();

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
            {t('wordSuggestions.title')}
          </h3>
          <p>
            {t('wordSuggestions.subtitle', { word: palabra.trim() })}
          </p>
        </div>
      </div>

      {cargando && (
        <p className="sugerencias-palabras__estado" role="status">
          {t('wordSuggestions.loading')}
        </p>
      )}

      {!cargando && hayError && (
        <p className="sugerencias-palabras__error" role="alert">
          {t('wordSuggestions.error')}
        </p>
      )}

      {!cargando && !hayError && sugerencias.length === 0 && (
        <p className="sugerencias-palabras__vacio">
          {t('wordSuggestions.empty')}
        </p>
      )}

      {!cargando && !hayError && sugerencias.length > 0 && (
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
            {t('wordSuggestions.note')}
          </p>
        </>
      )}
    </section>
  );
}
