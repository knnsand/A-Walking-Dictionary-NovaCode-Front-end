import { useContext } from 'react';
import { EncabezadoContext } from '../../contexto/EncabezadoContext';

/**
 * Barra superior del layout. Muestra el título y subtítulo que declaró la
 * pantalla activa (useEncabezadoPagina) y, en móvil, el botón ☰ del menú.
 * Si la pantalla no declara título, queda como antes: oculta en escritorio
 * y solo con el botón ☰ en móvil.
 */
export function EncabezadoPagina({ onAbrirMenu }) {
  const { encabezado } = useContext(EncabezadoContext);

  return (
    <div className={`topbar${encabezado ? ' topbar--con-titulo' : ''}`}>
      <button
        className="topbar__menu-btn"
        type="button"
        aria-label="Abrir menú"
        onClick={onAbrirMenu}
      >
        ☰
      </button>

      {encabezado && (
        <div className="encabezado-pagina">
          <h1 className="encabezado-pagina__titulo">{encabezado.titulo}</h1>
          {encabezado.subtitulo && (
            <p className="encabezado-pagina__subtitulo">{encabezado.subtitulo}</p>
          )}
        </div>
      )}
    </div>
  );
}
