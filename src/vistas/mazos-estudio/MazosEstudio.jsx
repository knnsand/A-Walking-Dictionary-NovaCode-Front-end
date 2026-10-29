/**
 * @file MazosEstudio.jsx
 * @brief Vista de mazos de estudio compartida por docente, estudiante e invitado.
 */

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { listarMazos } from '../../cliente-api/mazosApi';
import { MazoItem } from '../docente/crear-mazo/MazoItem';
import '../docente/crear-mazo/crear-mazo.css';
import '../docente/crear-mazo/mazos-creados.css';
import { useEncabezadoPagina } from '../../contexto/useEncabezadoPagina';

/**
 * @brief Ordena por semana (soporta números y textos como "2-3") y, a igual semana, por id.
 * @param {Object} a - Mazo.
 * @param {Object} b - Mazo.
 * @return {number} Negativo, cero o positivo, como espera Array.sort.
 */
function compararPorSemana(a, b) {
  return (
    String(a.semana).localeCompare(String(b.semana), 'en', { numeric: true }) ||
    a.id_mazo - b.id_mazo
  );
}

/**
 * @brief Vista "Mazos de estudio", compartida por los tres roles.
 * Todos ven nombre, autor, variante regional, semana y estado del mazo;
 * las acciones de cada tarjeta dependen del rol (ver MazoItem).
 *
 * @param {Object} props
 * @param {string} props.rol - 'docente' | 'estudiante' | 'invitado'.
 * @param {*} [props.refrescarTrigger] - Valor que, al cambiar, recarga la lista (lo usa el docente
 *   tras crear un mazo).
 * @return {JSX.Element}
 */
export function MazosEstudio({ rol, refrescarTrigger }) {
  const { t } = useTranslation();
  const [mazos, setMazos] = useState([]);
  // Guarda la CLAVE de traducción del error (no el texto); se traduce al mostrarlo.
  const [error, setError] = useState(null);

  // El título de la página lo pinta el layout (barra superior).
  useEncabezadoPagina(t('studyDecksPage.title'), t('studyDecksPage.subtitle'));

  /** @brief Carga los mazos desde el backend. */
  const cargarMazos = useCallback(() => {
    setError(null);
    listarMazos()
      .then(setMazos)
      .catch((e) => {
        console.error(e);
        setError('studyDecksPage.errors.loadFailed');
      });
  }, []);

  useEffect(() => {
    cargarMazos();
  }, [cargarMazos, refrescarTrigger]);

  /**
   * @brief Reemplaza en la lista el mazo que cambió de estado.
   * @param {Object} mazoActualizado - Mazo devuelto por el backend.
   */
  function actualizarMazoEnLista(mazoActualizado) {
    setMazos((anteriores) =>
      anteriores.map((mazo) =>
        mazo.id_mazo === mazoActualizado.id_mazo ? mazoActualizado : mazo
      )
    );
  }

  const mazosOrdenados = [...mazos].sort(compararPorSemana);

  return (
    <section className="mazos-creados">
      {error && (
        <p className="mazo-card__error" role="alert">
          {t(error)}
        </p>
      )}

      {mazosOrdenados.length === 0 && !error ? (
        <p className="empty-state">
          {t(`studyDecksPage.empty.${rol}`, {
            defaultValue: t('studyDecksPage.empty.invitado'),
          })}
        </p>
      ) : (
        <ul className="mazos-grid">
          {mazosOrdenados.map((mazo) => (
            <MazoItem
              key={mazo.id_mazo}
              mazo={mazo}
              rol={rol}
              onEstadoActualizado={actualizarMazoEnLista}
            />
          ))}
        </ul>
      )}
    </section>
  );
}