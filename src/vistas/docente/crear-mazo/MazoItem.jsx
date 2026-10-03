import { useState } from 'react';
import { actualizarEstadoMazo } from '../../../cliente-api/mazosApi';

const CANTIDAD_COLORES = 5;

export function MazoItem({ mazo, onEstadoActualizado }) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const abierto = mazo.estado === 'abierto';
  const color = (Number(mazo.semana) || 0) % CANTIDAD_COLORES;

  async function handleCambiarEstado() {
    const nuevoEstado = abierto ? 'cerrado' : 'abierto';

    setGuardando(true);
    setError(null);
    try {
      const mazoActualizado = await actualizarEstadoMazo(
        mazo.id_mazo,
        nuevoEstado
      );
      onEstadoActualizado?.(mazoActualizado);
    } catch (e) {
      console.error(e);
      setError('No se pudo cambiar el estado del mazo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <li className={`mazo-pila mazo-card--color-${color}`}>
      <div
        className={`mazo-pila__cara mazo-card${abierto ? '' : ' mazo-card--cerrado'}`}
      >
        <div className="mazo-card__cabecera">
          <span className="mazo-card__semana">Semana {mazo.semana}</span>
        </div>

        <h3 className="mazo-card__titulo">{mazo.nombre_lectura}</h3>
        <p className="mazo-card__autor">{mazo.autor}</p>

        {mazo.variante_regional_predeterminada && (
          <ul className="mazo-card__etiquetas" aria-label="Variante regional">
            <li className="mazo-card__etiqueta">
              {mazo.variante_regional_predeterminada}
            </li>
          </ul>
        )}

        <div className="mazo-card__pie">
          <span className="mazo-card__estado-texto">
            {abierto ? 'Mazo abierto para aportes' : 'Mazo cerrado'}
          </span>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCambiarEstado}
            disabled={guardando}
            aria-label={`${abierto ? 'Cerrar' : 'Abrir'} el mazo ${mazo.nombre_lectura}`}
          >
            {guardando ? 'Guardando...' : abierto ? 'Cerrar mazo' : 'Abrir mazo'}
          </button>
        </div>

        {error && (
          <p className="mazo-card__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </li>
  );
}