// vistas/estudiante/estudiar-tarjetas/BotonesValoracion.jsx
// HU-010 / CA-4.1.2: valoración del recuerdo (Repetir, Difícil, Buena, Fácil).
//
// El diseño muestra dos botones (Repasar / Aprendida), pero el criterio de aceptación y el back
// (SM2Service) trabajan con cuatro valoraciones. Se mantiene el estilo circular del diseño y
// se amplía a cuatro.

import { VALORACIONES_UI } from './estudiarTarjetas.constants';

const ICONO = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const IconoX = () => (
  <svg {...ICONO}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const IconoMenos = () => (
  <svg {...ICONO}>
    <path d="M5 12h14" />
  </svg>
);

const IconoCheck = () => (
  <svg {...ICONO}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const IconoCheckDoble = () => (
  <svg {...ICONO}>
    <path d="M18 6 7 17l-5-5" />
    <path d="m22 10-7.5 7.5L13 16" />
  </svg>
);

const ICONOS = {
  repetir: IconoX,
  dificil: IconoMenos,
  buena: IconoCheck,
  facil: IconoCheckDoble,
};

/**
 * @param {Object}   props
 * @param {boolean}  props.habilitado  false hasta que el estudiante haya visto la respuesta.
 * @param {boolean}  props.guardando   true mientras se envía la valoración al back.
 * @param {Function} props.onValorar   Recibe el texto exacto que espera el back.
 */
export function BotonesValoracion({ habilitado, guardando, onValorar }) {
  return (
    <div className="estudiar-valoracion" role="group" aria-label="¿Qué tan bien la recordaste?">
      {VALORACIONES_UI.map(({ id, valor, tecla, etiqueta }) => {
        const Icono = ICONOS[id];
        return (
          <div key={id} className="estudiar-valoracion__item">
            <button
              type="button"
              className={`estudiar-valoracion__boton estudiar-valoracion__boton--${id}`}
              disabled={!habilitado || guardando}
              aria-keyshortcuts={tecla}
              aria-label={`${etiqueta} (tecla ${tecla})`}
              onClick={() => onValorar(valor)}
            >
              <Icono />
            </button>
            <span className="estudiar-valoracion__texto" aria-hidden="true">
              {etiqueta} ({tecla})
            </span>
          </div>
        );
      })}
    </div>
  );
}
