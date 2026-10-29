/**
 * @file InscribirEstudianteForm.jsx
 * @brief Formulario para inscribir un estudiante en un curso por correo (HU-5.3.2).
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listarCursos } from '../../../cliente-api/cursosApi';
import { inscribirEstudiante } from '../../../cliente-api/inscripcionesApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { FORM_INICIAL } from './inscribirEstudiante.constants';
import { validarCamposObligatorios, validarFormatoEmail } from './inscribirEstudiante.validation';

/**
 * @brief Formulario con el curso y el correo del estudiante a inscribir.
 * @param {Object} props
 * @param {Function} [props.onCerrar] - Cierra el formulario.
 * @param {Function} [props.onInscripcionCreada] - Recibe la inscripción creada.
 * @return {JSX.Element}
 */
export function InscribirEstudianteForm({ onCerrar, onInscripcionCreada }) {
  const { t } = useTranslation();
  const [cursos, setCursos] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    void listarCursos().then(setCursos);
  }, []);

  /**
   * @brief Actualiza el campo del formulario que cambió.
   * @param {Event} evento - Evento change del input o select.
   */
  function handleChange(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  /**
   * @brief Valida el formulario e inscribe al estudiante en el curso.
   * @param {SubmitEvent} evento - Evento submit del formulario.
   */
  async function handleSubmit(evento) {
    evento.preventDefault();

    if (!validarCamposObligatorios(form)) {
      setAviso({ tipo: 'error', mensaje: t('enrollStudentForm.errors.required') });
      return;
    }
    if (!validarFormatoEmail(form.email)) {
      setAviso({ tipo: 'error', mensaje: t('enrollStudentForm.errors.invalidEmail') });
      return;
    }

    setEnviando(true);
    try {
      const inscripcion = await inscribirEstudiante(Number(form.curso_id), form.email);
      setAviso({
        tipo: 'exito',
        mensaje: t('enrollStudentForm.success', {
          name: inscripcion.nombre_estudiante || t('enrollStudentForm.theStudent'),
        }),
      });
      setForm((anterior) => ({ ...anterior, email: '' }));
      onInscripcionCreada?.(inscripcion);
    } catch (error) {
      // error.message viene del backend y puede estar en español (pendiente de revisar).
      setAviso({ tipo: 'error', mensaje: error.message || t('enrollStudentForm.errors.enrollFailed') });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="card-mazo" onSubmit={handleSubmit} noValidate>
      <div className="card-mazo__header">
        <div>
          <h2 className="card-mazo__title">{t('enrollStudentForm.title')}</h2>
          <p className="card-mazo__subtitle">{t('enrollStudentForm.subtitle')}</p>
        </div>
        <button type="button" className="card-mazo__close" onClick={onCerrar} aria-label={t('enrollStudentForm.close')}>×</button>
      </div>

      <div className="card-mazo__body">
        <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />
        <div className="form-group">
          <label className="form-label" htmlFor="curso_id">{t('enrollStudentForm.course')}</label>
          <select id="curso_id" className="form-select" name="curso_id" value={form.curso_id} onChange={handleChange}>
            <option value="">{t('enrollStudentForm.selectCourse')}</option>
            {cursos.map((curso) => (
              <option key={curso.id_curso} value={curso.id_curso}>{curso.nombre}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">{t('enrollStudentForm.studentEmail')}</label>
          <input
            id="email"
            className="form-input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t('enrollStudentForm.emailPlaceholder')}
          />
        </div>
      </div>

      <div className="card-mazo__footer">
        <button type="button" className="btn btn-secondary" onClick={onCerrar}>{t('enrollStudentForm.actions.cancel')}</button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? t('enrollStudentForm.actions.enrolling') : t('enrollStudentForm.actions.enroll')}
        </button>
      </div>
    </form>
  );
}