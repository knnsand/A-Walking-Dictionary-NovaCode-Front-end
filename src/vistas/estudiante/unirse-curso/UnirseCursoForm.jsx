/**
 * @file UnirseCursoForm.jsx
 * @brief Formulario para unirse a un curso con código de acceso (HU-5.3.1).
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { unirseCurso } from '../../../cliente-api/inscripcionesApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { useAuth } from '../../../contexto/useAuth';
import { FORM_INICIAL } from './unirseCurso.constants';
import { validarCamposObligatorios } from './unirseCurso.validation';

/**
 * @brief Formulario con el código de acceso que entrega la docente.
 * @param {Object} props
 * @param {Function} [props.onCerrar] - Cierra el formulario.
 * @param {Function} [props.onInscripcionCreada] - Recibe la inscripción creada.
 * @return {JSX.Element}
 */
export function UnirseCursoForm({ onCerrar, onInscripcionCreada }) {
  const { t } = useTranslation();
  const { estudianteId } = useAuth();
  const [form, setForm] = useState(FORM_INICIAL);
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });
  const [enviando, setEnviando] = useState(false);

  /**
   * @brief Actualiza el campo del formulario que cambió.
   * @param {Event} evento - Evento change del input o select.
   */
  function handleChange(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  /**
   * @brief Valida el código e inscribe al estudiante en el curso.
   * @param {SubmitEvent} evento - Evento submit del formulario.
   */
  async function handleSubmit(evento) {
    evento.preventDefault();

    if (!validarCamposObligatorios(form)) {
      setAviso({ tipo: 'error', mensaje: t('joinCourseForm.errors.codeRequired') });
      return;
    }

    if (!estudianteId) {
      setAviso({
        tipo: 'error',
        mensaje: t('joinCourseForm.errors.noStudent'),
      });
      return;
    }

    setEnviando(true);
    try {
      const inscripcion = await unirseCurso(form.codigo_acceso, estudianteId);
      setAviso({ tipo: 'exito', mensaje: t('joinCourseForm.success') });
      setForm(FORM_INICIAL);
      onInscripcionCreada?.(inscripcion);
    } catch (error) {
      // error.message viene del backend y puede estar en español (pendiente de revisar).
      setAviso({ tipo: 'error', mensaje: error.message || t('joinCourseForm.errors.joinFailed') });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="card-mazo" onSubmit={handleSubmit}>
      <div className="card-mazo__header">
        <div>
          <h2 className="card-mazo__title">{t('joinCourseForm.title')}</h2>
          <p className="card-mazo__subtitle">{t('joinCourseForm.subtitle')}</p>
        </div>
        <button type="button" className="card-mazo__close" onClick={onCerrar} aria-label={t('joinCourseForm.close')}>×</button>
      </div>

      <div className="card-mazo__body">
        <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />
        <div className="form-group">
          <label className="form-label" htmlFor="codigo_acceso">{t('joinCourseForm.accessCode')}</label>
          <input
            id="codigo_acceso"
            className="form-input"
            type="text"
            name="codigo_acceso"
            value={form.codigo_acceso}
            onChange={handleChange}
            placeholder={t('joinCourseForm.accessCodePlaceholder')}
          />
        </div>
      </div>

      <div className="card-mazo__footer">
        <button type="button" className="btn btn-secondary" onClick={onCerrar}>{t('joinCourseForm.actions.cancel')}</button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? t('joinCourseForm.actions.joining') : t('joinCourseForm.actions.join')}
        </button>
      </div>
    </form>
  );
}