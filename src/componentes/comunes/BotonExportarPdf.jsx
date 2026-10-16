import { useState } from 'react';
import { useAuth } from '../../contexto/useAuth';
import { TEXTOS_EXPORTAR_PDF, clasificarErrorExportacion } from './exportarPdf.constants';
import './boton-exportar-pdf.css';

/**
 * Botón "Exportar a PDF" (HU-3.3). Ejecuta `onExportar`, que debe descargar el
 * archivo (ver cliente-api/exportacionesApi.js), muestra un indicador de carga
 * mientras se genera y avisa si algo falla.
 *
 * Solo para la docente: los endpoints de exportación responden 403 a otros roles,
 * así que quien lo use debe renderizarlo únicamente cuando el rol sea docente.
 *
 * @param {Object} props
 * @param {() => Promise<void>} props.onExportar - Descarga el PDF; si falla, lanza un Error.
 * @param {string} props.etiqueta - Texto del botón en reposo.
 * @param {string} [props.etiquetaCargando] - Texto mientras se genera el PDF.
 * @param {string} [props.ariaLabel] - Nombre accesible, útil cuando hay varios botones iguales.
 * @param {boolean} [props.disabled] - Deshabilita el botón desde afuera.
 */
export function BotonExportarPdf({
  onExportar,
  etiqueta,
  etiquetaCargando = TEXTOS_EXPORTAR_PDF.cargando,
  ariaLabel,
  disabled = false,
}) {
  const { logout } = useAuth();
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState(null);

  async function handleClick() {
    if (exportando) return;

    setExportando(true);
    setError(null);
    try {
      await onExportar();
    } catch (e) {
      console.error(e);
      const { mensaje, cerrarSesion } = clasificarErrorExportacion(e?.message);
      setError(mensaje);
      if (cerrarSesion) logout();
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="boton-exportar-pdf">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleClick}
        disabled={disabled || exportando}
        aria-label={ariaLabel}
        aria-busy={exportando}
      >
        {exportando ? etiquetaCargando : etiqueta}
      </button>

      {error && (
        <p className="boton-exportar-pdf__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
