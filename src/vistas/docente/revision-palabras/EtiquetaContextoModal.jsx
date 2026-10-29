/**
 * @file EtiquetaContextoModal.jsx
 * @brief Modal para asignar registro y variante regional al aprobar una tarjeta (HU-005).
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Aviso } from "../../../componentes/comunes/Aviso";
import { REGISTROS } from './revisionPalabras.constants';
import {
  VARIANTES_REGIONALES,
  VARIANTE_REGIONAL_CLAVES,
} from '../crear-mazo/crearMazo.constants';

/**
 * @brief HU-005: paso obligatorio antes de aprobar una tarjeta (EPIC-002).
 * Se abre automáticamente al presionar "Aprobar" en TarjetaPendienteCard;
 * el docente debe asignar registro y variante regional para poder
 * confirmar la aprobación. Si cancela, la tarjeta permanece pendiente.
 *
 * Campos según criterio de aceptación literal de HU-005: "La tarjeta
 * permite seleccionar registro (Formal, informal, slang, coloquial,
 * anticuado) y variante dialectal".
 *
 * Los valores de registro y variante se guardan en español en la base de datos;
 * aquí solo se traduce lo que se muestra.
 *
 * No llama a la API directamente: delega en onConfirmar(contexto),
 * para que RevisionPalabras.jsx orqueste juntas la aprobación
 * (aprobarTarjeta) y el guardado de contexto (actualizarContextoTarjeta)
 * como una sola operación desde la perspectiva del usuario.
 * @param {Object} props
 * @param {Object} props.tarjeta - Tarjeta que se va a aprobar.
 * @param {Function} props.onCerrar - Cierra el modal sin aprobar.
 * @param {Function} props.onConfirmar - Recibe { registro, variante_regional }.
 * @param {boolean} props.guardando - Deshabilita las acciones mientras se guarda.
 * @return {JSX.Element}
 */
export function EtiquetaContextoModal({ tarjeta, onCerrar, onConfirmar, guardando }) {
  const { t } = useTranslation();
  const [registro, setRegistro] = useState(tarjeta.registro || '');
  const [varianteRegional, setVarianteRegional] = useState(tarjeta.variante_regional || '');
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });

  /** @brief Valida que se eligieron registro y variante y los envía a onConfirmar. */
  function handleConfirmar() {
    if (!registro || !varianteRegional) {
      setAviso({ tipo: 'error', mensaje: t('contextModal.errors.required') });
      return;
    }
    onConfirmar({ registro, variante_regional: varianteRegional });
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t('contextModal.ariaLabel', { word: tarjeta.palabra })}>
      <div className="card-mazo modal-card">
        <div className="card-mazo__header">
          <div className="card-mazo__icon" aria-hidden="true" />
          <div>
            <h2 className="card-mazo__title">{t('contextModal.title', { word: tarjeta.palabra })}</h2>
            <p className="card-mazo__subtitle">{t('contextModal.subtitle')}</p>
          </div>
        </div>

        <div className="card-mazo__body">
          <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />

          <div className="info-box">
            {t('contextModal.info')}
          </div>

          <div className="form-group">
            <span className="form-label">{t('contextModal.register')}</span>
            <div className="chip-group" role="radiogroup" aria-label={t('contextModal.register')}>
              {REGISTROS.map((opcion) => (
                <div className="chip-option" key={opcion.value}>
                  <input
                    type="radio"
                    id={`registro-${opcion.value}`}
                    name="registro"
                    checked={registro === opcion.value}
                    onChange={() => setRegistro(opcion.value)}
                  />
                  <label htmlFor={`registro-${opcion.value}`}>{t(opcion.labelKey)}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="variante-regional">{t('contextModal.regionalVariant')}</label>
            <select
              id="variante-regional"
              className="form-select"
              value={varianteRegional}
              onChange={(evento) => setVarianteRegional(evento.target.value)}
            >
              <option value="">{t('contextModal.selectVariant')}</option>
              {VARIANTES_REGIONALES.map((v) => (
                <option key={v} value={v}>{t(VARIANTE_REGIONAL_CLAVES[v])}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-mazo__footer">
          <button className="btn btn-secondary" onClick={onCerrar} disabled={guardando}>{t('contextModal.actions.cancel')}</button>
          <button className="btn btn-primary" onClick={handleConfirmar} disabled={guardando}>
            {guardando ? t('contextModal.actions.confirming') : t('contextModal.actions.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}