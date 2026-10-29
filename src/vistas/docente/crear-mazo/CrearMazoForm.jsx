/**
 * @file CrearMazoForm.jsx
 * @brief Formulario para crear un mazo de estudio (HU-001).
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listarCursos } from '../../../cliente-api/cursosApi';
import { crearMazo } from '../../../cliente-api/mazosApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { useAuth } from '../../../contexto/useAuth';

import './crear-mazo.css';

import {
  validarCamposObligatorios,
  validarFechas,
} from './crearMazo.validation';

import {
  VARIANTES_REGIONALES,
  VARIANTE_REGIONAL_CLAVES,
  SEMANAS_SEMESTRE,
  FORM_INICIAL,
} from './crearMazo.constants';


/**
 * @brief Formulario de creación de mazo: curso, lectura, autor, semana, variante regional,
 * estado y fechas de apertura y cierre.
 * @param {Object} props
 * @param {Function} [props.onMazoCreado] - Recibe el mazo creado.
 * @param {Function} [props.onCerrar] - Cierra el formulario.
 * @return {JSX.Element}
 */
export function CrearMazoForm({ onMazoCreado, onCerrar }) {
  const { t, i18n } = useTranslation();
  const { docenteId } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });
  const [enviando, setEnviando] = useState(false);

  // Formatea mes y día de cada semana (por ejemplo "August 6") según el idioma activo.
  const formatoFecha = new Intl.DateTimeFormat(i18n.language, {
    month: 'long',
    day: 'numeric',
  });

  /**
   * @brief Arma el texto de una opción de semana, por ejemplo "Week 1 (August 6)".
   * @param {{value: string, mes: number, dia: number}} semana - Semana de SEMANAS_SEMESTRE.
   * @return {string} Texto traducido de la opción.
   */
  function etiquetaSemana(semana) {
    return t('createDeckForm.weekOption', {
      week: semana.value,
      date: formatoFecha.format(new Date(2000, semana.mes - 1, semana.dia)),
    });
  }

  /**
   * @brief La variante se guarda en español en la base de datos; aquí solo se traduce
   * lo que se muestra. Si llegara un valor desconocido, se muestra tal cual.
   * @param {string} variante - Variante regional en español.
   * @return {string} Texto a mostrar.
   */
  function etiquetaVariante(variante) {
    const clave = VARIANTE_REGIONAL_CLAVES[variante];
    return clave ? t(clave) : variante;
  }

  useEffect(() => {
    listarCursos().then(setCursos);
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
   * @brief Valida el formulario y crea el mazo en el backend.
   * @param {SubmitEvent} evento - Evento submit del formulario.
   */
  async function handleSubmit(evento) {
    evento.preventDefault();

    if (!validarCamposObligatorios(form)) {
      setAviso({ tipo: 'error', mensaje: t('createDeckForm.errors.requiredFields') });
      return;
    }

    if (!validarFechas(form)) {
      setAviso({ tipo: 'error', mensaje: t('createDeckForm.errors.invalidDates') });
      return;
    }

    if (!docenteId) {
      setAviso({ tipo: 'error', mensaje: t('createDeckForm.errors.noTeacher') });
      return;
    }

    setEnviando(true);
    try {
      const mazoCreado = await crearMazo({
        ...form,
        curso_id: Number(form.curso_id),
        docente_id: docenteId,
      });
      setAviso({
        tipo: 'exito',
        mensaje: t('createDeckForm.success', { name: mazoCreado.nombre_lectura }),
      });
      setForm((anterior) => ({ ...anterior, nombre_lectura: '', autor: '', semana: '', fecha_apertura: '', fecha_cierre: '' }));
      onMazoCreado?.(mazoCreado);
    } catch (error) {
      // error.message viene del backend y puede estar en español (pendiente de revisar).
      setAviso({
        tipo: 'error',
        mensaje: t('createDeckForm.errors.createFailed', { message: error.message }),
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="card-mazo" onSubmit={handleSubmit}>
      <div className="card-mazo__header">
        <div className="card-mazo__icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 4.5C5 3.67 5.67 3 6.5 3H19V18H6.5C5.67 18 5 18.67 5 19.5V4.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M5 19.5C5 18.67 5.67 18 6.5 18H19V21H6.5C5.67 21 5 20.33 5 19.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M9 7H15M9 10H15"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <h2 className="card-mazo__title">{t('createDeckForm.title')}</h2>
          <p className="card-mazo__subtitle">{t('createDeckForm.subtitle')}</p>
        </div>

        <button
          type="button"
          className="card-mazo__close"
          onClick={onCerrar}
          aria-label={t('createDeckForm.close')}
        >
          ×
        </button>
      </div>

      <div className="card-mazo__body">
        <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />

        <div className="form-row">
          <div className="form-group">
            <label className="form-label form-label--obligatorio" htmlFor="semana">{t('createDeckForm.fields.week')}</label>
            <select id="semana" className="form-select" name="semana" value={form.semana} onChange={handleChange}>
              <option value="">{t('createDeckForm.fields.selectWeek')}</option>
              {SEMANAS_SEMESTRE.map((semana) => (
                <option key={semana.value} value={semana.value}>{etiquetaSemana(semana)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label form-label--obligatorio" htmlFor="curso_id">{t('createDeckForm.fields.course')}</label>
            <select id="curso_id" className="form-select" name="curso_id" value={form.curso_id} onChange={handleChange}>
              <option value="">{t('createDeckForm.fields.selectCourse')}</option>
              {cursos.map((curso) => (
                <option key={curso.id_curso} value={curso.id_curso}>{curso.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label form-label--obligatorio" htmlFor="nombre_lectura">{t('createDeckForm.fields.work')}</label>
            <input id="nombre_lectura" className="form-input" type="text" name="nombre_lectura" value={form.nombre_lectura} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label form-label--obligatorio" htmlFor="autor">{t('createDeckForm.fields.author')}</label>
            <input id="autor" className="form-input" type="text" name="autor" value={form.autor} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label form-label--obligatorio" htmlFor="fecha_apertura">{t('createDeckForm.fields.openingDate')}</label>
            <input id="fecha_apertura" className="form-input" type="date" name="fecha_apertura" value={form.fecha_apertura} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label form-label--obligatorio" htmlFor="fecha_cierre">{t('createDeckForm.fields.closingDate')}</label>
            <input id="fecha_cierre" className="form-input" type="date" name="fecha_cierre" value={form.fecha_cierre} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <span className="form-label form-label--obligatorio">{t('createDeckForm.fields.regionalVariant')}</span>
          <div className="chip-group" role="radiogroup" aria-label={t('createDeckForm.fields.regionalVariant')}>
            {VARIANTES_REGIONALES.map((variante) => (
              <div className="chip-option" key={variante}>
                <input
                  type="radio"
                  id={`variante-${variante}`}
                  name="variante_regional_predeterminada"
                  value={variante}
                  checked={form.variante_regional_predeterminada === variante}
                  onChange={handleChange}
                />
                <label htmlFor={`variante-${variante}`}>{etiquetaVariante(variante)}</label>
              </div>
            ))}
          </div>
        </div>

        <p className="form-leyenda-obligatorio">{t('createDeckForm.requiredLegend')}</p>

        <div className="info-box">
          {t('createDeckForm.info')}
        </div>
      </div>

      <div className="card-mazo__footer">
        <button type="button" className="btn btn-secondary" onClick={onCerrar}>{t('createDeckForm.actions.cancel')}</button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? t('createDeckForm.actions.creating') : t('createDeckForm.actions.create')}
        </button>
      </div>
    </form>
  );
}