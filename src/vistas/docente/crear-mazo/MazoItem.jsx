import { actualizarEstadoMazo } from '../../../cliente-api/mazosApi';

export function MazoItem({ mazo, onEstadoActualizado }) {
  async function handleEstadoChange(evento) {
    const nuevoEstado = evento.target.value;

    try {
      const mazoActualizado = await actualizarEstadoMazo(
        mazo.id_mazo,
        nuevoEstado
      );

      onEstadoActualizado?.(mazoActualizado);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <li className="mazo-list__item">
      <div className="mazo-list__info">
        <strong>{mazo.nombre_lectura}</strong>

        <span className="mazo-list__meta">
          {mazo.autor} · Semana {mazo.semana} ·{' '}
          {mazo.variante_regional_predeterminada}
        </span>
      </div>

      <select
        className="form-select"
        value={mazo.estado}
        onChange={handleEstadoChange}
        aria-label={`Estado del mazo ${mazo.nombre_lectura}`}
      >
        <option value="abierto">Abierto</option>
        <option value="cerrado">Cerrado</option>
      </select>
    </li>
  );
}