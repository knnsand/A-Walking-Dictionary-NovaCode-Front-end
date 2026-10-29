import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexto/useAuth';
import { TEXTOS_EXPORTAR_PDF, clasificarErrorExportacion } from './exportarPdf.constants';
import './boton-exportar-pdf.css';

/**
* Botón reutilizable para descargar reportes y exportaciones PDF.
 *
 * Ejecuta la función onExportar, muestra un indicador de carga
 * mientras se descarga el archivo y presenta errores si ocurren.
 *
 * Puede utilizarse tanto en vistas de docente como de estudiante.
 * Los permisos de acceso deben verificarse en el backend
 * según el endpoint y el rol del usuario.
 *
 * @param {Object} props
 * @param {() => Promise<void>} props.onExportar - Descarga el PDF; si falla, lanza un Error.
 * @param {string} props.etiqueta - Texto del botón en reposo (ya traducido por quien lo usa).
 * @param {string} [props.etiquetaCargando] - Texto mientras se genera el PDF (ya traducido;
 *   por defecto, el texto estándar de `pdfExport.loading`).
 * @param {string} [props.ariaLabel] - Nombre accesible, útil cuando hay varios botones iguales.
 * @param {boolean} [props.disabled] - Deshabilita el botón desde afuera.
 */
export function BotonExportarPdf({
  onExportar,
  etiqueta,
  etiquetaCargando,
  ariaLabel,
  disabled = false,
}) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [exportando, setExportando] = useState(false);
  // { clave } (texto del front, se traduce al mostrarlo) o { mensaje } (texto del backend, tal cual).
  const [error, setError] = useState(null);

  async function handleClick() {
    if (exportando) return;

    setExportando(true);
    setError(null);
    try {
      await onExportar();
    } catch (e) {
      console.error(e);
      const { clave, mensaje, cerrarSesion } = clasificarErrorExportacion(e?.message);
      setError(clave ? { clave } : { mensaje });
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
        {exportando ? (etiquetaCargando ?? t(TEXTOS_EXPORTAR_PDF.cargando)) : etiqueta}
      </button>

      {error && (
        <p className="boton-exportar-pdf__error" role="alert">
          {error.clave ? t(error.clave) : error.mensaje}
        </p>
      )}
    </div>
  );
}
