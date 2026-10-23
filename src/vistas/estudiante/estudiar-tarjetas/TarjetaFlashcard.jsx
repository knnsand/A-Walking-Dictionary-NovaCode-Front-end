
import SugerenciasPalabras from './SugerenciasPalabras';

// vistas/estudiante/estudiar-tarjetas/TarjetaFlashcard.jsx
// HU-010 / CA-4.1.1: frente (palabra en inglés) y dorso (traducción, definición y ejemplo).
//
// Componente de presentación: no llama a la API ni guarda estado. El estado de "volteada"
// vive en EstudiarTarjetas.jsx.
//
// Campos opcionales de la tarjeta (el diseño los muestra; el back aún no los devuelve):
//   fonetica, categoria_gramatical

import { useTranslation } from 'react-i18next';

const ICONO = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const IconoGirar = () => (
  <svg {...ICONO} width={13} height={13}>
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <path d="M21 3v6h-6" />
  </svg>
);

const IconoAltavoz = () => (
  <svg {...ICONO} width={20} height={20}>
    <path d="M11 5 6 9H3v6h3l5 4V5z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);

const puedeHablar = () =>
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  typeof window.SpeechSynthesisUtterance !== 'undefined';

function conComillas(texto) {
  return /^["“'‘]/.test(texto.trim()) ? texto : `“${texto}”`;
}

/**
 * @param {Object}   props
 * @param {Object}   props.tarjeta        Tarjeta actual (campos en español del back).
 * @param {boolean}  props.volteada       true = se ve el dorso.
 * @param {boolean}  [props.repetida]     true si el estudiante ya marcó "Repetir" en esta sesión.
 * @param {Array}    props.atajos         [{ tecla, etiquetaKey }] para la pastilla de teclado.
 * @param {Function} props.onVoltear
 * @param {Object}   [props.botonGiroRef] Ref del botón de giro (para manejar el foco).
 */
export function TarjetaFlashcard({
  tarjeta,
  volteada,
  repetida = false,
  atajos,
  onVoltear,
  botonGiroRef,
}) {
  const { t } = useTranslation();

  const escuchar = (evento) => {
    evento.stopPropagation();
    if (!puedeHablar()) return;
    const sintesis = window.speechSynthesis;
    sintesis.cancel();
    const locucion = new window.SpeechSynthesisUtterance(tarjeta.palabra);
    locucion.lang = 'en';
    locucion.rate = 0.9;
    sintesis.speak(locucion);
  };

  const girar = (evento) => {
    evento.stopPropagation();
    onVoltear();
  };

  return (
    <div
      className={`estudiar-tarjeta${volteada ? ' es-volteada' : ''}`}
      role="presentation"
      onClick={onVoltear}
      aria-live="polite"
    >
      {/* Botón real de giro: fuera de las caras para no rotar y conservar el foco. */}
      <button
        type="button"
        ref={botonGiroRef}
        className={`estudiar-giro${volteada ? ' estudiar-giro--dorso' : ''}`}
        aria-label={t('studySession.card.flip')}
        aria-pressed={volteada}
        onClick={girar}
      >
        <IconoGirar />
        <span>{t('studySession.card.clickToFlip')}</span>
      </button>

      <div className="estudiar-tarjeta__interior">
        {/* ---------- Frente ---------- */}
        <div className="estudiar-cara estudiar-cara--frente" aria-hidden={volteada}>
          {repetida && <span className="estudiar-chip estudiar-chip--repetida">{t('studySession.card.again')}</span>}

          <div className="estudiar-cara__contenido estudiar-cara__contenido--frente">
            <p className="estudiar-etiqueta">{t('studySession.card.termToRemember')}</p>
            <p className="estudiar-palabra" lang="en">
              {tarjeta.palabra}
            </p>

            {puedeHablar() && (
              <button
                type="button"
                className="estudiar-audio"
                aria-label={t('studySession.card.listen', { word: tarjeta.palabra })}
                tabIndex={volteada ? -1 : 0}
                onClick={escuchar}
              >
                <IconoAltavoz />
              </button>
            )}

            {tarjeta.fonetica && (
              <p className="estudiar-fonetica" lang="en">
                {tarjeta.fonetica}
              </p>
            )}
          </div>

          <p className="estudiar-atajos" aria-hidden="true">
            <span>
              <strong>{t('studySession.card.shortcutSpace')}</strong> {t('studySession.card.shortcutFlip')}
            </span>
            {atajos.map((atajo) => (
              <span key={atajo.tecla}>
                <strong>{atajo.tecla}</strong> {t(atajo.etiquetaKey)}
              </span>
            ))}
          </p>
        </div>

        {/* ---------- Dorso ---------- */}
        <div className="estudiar-cara estudiar-cara--dorso" aria-hidden={!volteada}>
          <div className="estudiar-cara__contenido estudiar-cara__contenido--dorso">
            <div className="estudiar-dorso__cabecera">
              <div>
                <p className="estudiar-dorso__palabra" lang="en">
                  {tarjeta.palabra}
                </p>
                <span className="estudiar-subrayado" aria-hidden="true" />
              </div>
              {tarjeta.categoria_gramatical && (
                <span className="estudiar-dorso__categoria">{tarjeta.categoria_gramatical}</span>
              )}
            </div>

            <p className="estudiar-etiqueta">{t('studySession.card.translation')}</p>
            <p className="estudiar-traduccion">{tarjeta.traduccion}</p>

            <p className="estudiar-etiqueta">{t('studySession.card.definition')}</p>
            <p className="estudiar-definicion">{tarjeta.definicion}</p>

            {tarjeta.ejemplo && (
              <aside className="estudiar-cita">
                <p className="estudiar-etiqueta estudiar-etiqueta--chica">
                  {t('studySession.card.quoteContext')}
                </p>
                <p className="estudiar-cita__texto">{conComillas(tarjeta.ejemplo)}</p>
              </aside>
            )}

            <SugerenciasPalabras palabra={tarjeta.palabra} />
          </div>
        </div>
      </div>
    </div>
  );
}