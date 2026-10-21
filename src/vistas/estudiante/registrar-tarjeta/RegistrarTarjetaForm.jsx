import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  FORM_INICIAL,
  LIMITE_EJEMPLO,
} from './registrarTarjeta.constants';

import {
  validarCamposObligatorios,
  validarEjemplo,
  mazoAceptaPalabras,
} from './registrarTarjeta.validation';

import { listarMazos } from '../../../cliente-api/mazosApi';
import { verificarDuplicado, registrarTarjeta } from '../../../cliente-api/tarjetasApi';
import { useAuth } from '../../../contexto/useAuth';

// Descriptor de error para fallos de la API: si el backend trae mensaje se muestra tal cual
// (puede estar en español, pendiente de revisar); si no, se usa el mensaje propio.
function errorDeApi(e) {
  return e.message
    ? { mensaje: e.message }
    : { clave: 'registerWordForm.errors.processFailed' };
}

export function RegistrarTarjetaForm({ onCerrar }) {
  const { t } = useTranslation();
  const { inscripcionId } = useAuth();
  const [form, setForm] = useState(FORM_INICIAL);
  // Descriptor del error: { clave, valores } (texto propio, se traduce al mostrarlo)
  // o { mensaje } (texto del backend, se muestra tal cual).
  const [error, setError] = useState(null);
  const [exito, setExito] = useState('');
  const [mazos, setMazos] = useState([]);
  const [mazosCargados, setMazosCargados] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);

  useEffect(() => {
    async function cargarMazos() {
      try {
        // Con sesión de estudiante, GET /decks ya trae solo los mazos de sus cursos (CA-1.2.1).
        const datos = await listarMazos();
        setMazos(datos.filter((mazo) => mazoAceptaPalabras(mazo)));
        setMazosCargados(true);
      } catch (e) {
        console.error(e);
        setError({ clave: 'registerWordForm.errors.loadDecks' });
      }
    }

    cargarMazos();
  }, []);

  function handleChange(evento) {
    const { name, value } = evento.target;

    setForm((actual) => ({
      ...actual,
      [name]: value,
    }));

    setError(null);
    setExito('');
    setConfirmacion(null);
  }

  async function handleSubmit(evento) {
    evento.preventDefault();

    setError(null);
    setExito('');

    if (!validarCamposObligatorios(form)) {
      setError({ clave: 'registerWordForm.errors.requiredFields' });
      return;
    }

    if (!validarEjemplo(form.ejemplo)) {
      setError({
        clave: 'registerWordForm.errors.exampleTooLong',
        valores: { max: LIMITE_EJEMPLO },
      });
      return;
    }

    if (!form.mazo_id) {
      setError({ clave: 'registerWordForm.errors.selectDeck' });
      return;
    }

    try {
      const chequeo = await verificarDuplicado(
        Number(form.mazo_id),
        form.palabra,
        form.definicion,
        form.ejemplo
      );

      if (chequeo.duplicado) {
        setConfirmacion(chequeo.resultado);
        return;
      }

      await enviarTarjeta();
    } catch (e) {
      console.error(e);
      setError(errorDeApi(e));
    }
  }

  async function enviarTarjeta() {
    try {
      const registro = await registrarTarjeta(Number(form.mazo_id), {
        palabra: form.palabra.trim(),
        traduccion: form.traduccion.trim(),
        definicion: form.definicion.trim(),
        ejemplo: form.ejemplo.trim(),
        // El backend toma la inscripción del estudiante que inició sesión (CA-1.2.1); este
        // valor simulado solo se usa cuando el backend corre con DISABLE_AUTH=true.
        inscripcion_id: inscripcionId,
      });

      if (registro.resultado === 'coautoria') {
        setExito(t('registerWordForm.success.coauthor'));
      } else if (registro.resultado === 'acepcion_nueva') {
        setExito(t('registerWordForm.success.newMeaning'));
      } else {
        setExito(t('registerWordForm.success.submitted'));
      }

      setForm(FORM_INICIAL);
      setConfirmacion(null);
    } catch (e) {
      console.error(e);
      setError(errorDeApi(e));
    }
  }

  return (
    <form className="form-tarjeta" onSubmit={handleSubmit}>
      <div className="form-tarjeta__header">
        <div>
          <h2>{t('registerWordForm.title')}</h2>
        </div>

        {onCerrar && (
          <button
            type="button"
            className="btn-cerrar"
            onClick={onCerrar}
            aria-label={t('registerWordForm.close')}
          >
            ×
          </button>
        )}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error.clave ? t(error.clave, error.valores) : error.mensaje}
        </p>
      )}

      {exito && (
        <p className="form-success" role="status">
          {exito}
        </p>
      )}

      <p className="form-leyenda-obligatorio">
        {t('registerWordForm.requiredLegend')}
      </p>

      {confirmacion && (
        <div className="form-tarjeta__notice" role="alert">
          {confirmacion === 'coautoria' ? (
            <>
              <strong>{t('registerWordForm.duplicate.sameTitle')}</strong>
              <p>{t('registerWordForm.duplicate.sameText')}</p>
            </>
          ) : (
            <>
              <strong>{t('registerWordForm.duplicate.differentTitle')}</strong>
              <p>{t('registerWordForm.duplicate.differentText')}</p>
            </>
          )}

          <div className="form-tarjeta__footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmacion(null)}
            >
              {t('registerWordForm.duplicate.cancel')}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={enviarTarjeta}
            >
              {t('registerWordForm.duplicate.confirm')}
            </button>
          </div>
        </div>
      )}

      <section className="form-tarjeta__section">
        <div className="form-tarjeta__section-header">
          <span>1.</span>
          <h3>{t('registerWordForm.lexical.title')}</h3>
        </div>

        <div className="form-tarjeta__grid">
          <div className="form-field">
            <label htmlFor="palabra" className="form-label--obligatorio">
              {t('registerWordForm.lexical.word')}
            </label>
            <input
              id="palabra"
              name="palabra"
              type="text"
              value={form.palabra}
              onChange={handleChange}
              placeholder={t('registerWordForm.lexical.wordPlaceholder')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="traduccion" className="form-label--obligatorio">
              {t('registerWordForm.lexical.translation')}
            </label>
            <input
              id="traduccion"
              name="traduccion"
              type="text"
              value={form.traduccion}
              onChange={handleChange}
              placeholder={t('registerWordForm.lexical.translationPlaceholder')}
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="definicion" className="form-label--obligatorio">
            {t('registerWordForm.lexical.definition')}
          </label>
          <textarea
            id="definicion"
            name="definicion"
            value={form.definicion}
            onChange={handleChange}
            placeholder={t('registerWordForm.lexical.definitionPlaceholder')}
            rows="4"
          />
        </div>

        <div className="form-field">
          <label htmlFor="ejemplo">
            {t('registerWordForm.lexical.example')}
          </label>
          <textarea
            id="ejemplo"
            name="ejemplo"
            value={form.ejemplo}
            onChange={handleChange}
            placeholder={t('registerWordForm.lexical.examplePlaceholder')}
            maxLength={LIMITE_EJEMPLO}
            rows="3"
          />

          <small className="form-field__counter">
            {t('registerWordForm.lexical.characterCount', {
              current: form.ejemplo.length,
              max: LIMITE_EJEMPLO,
            })}
          </small>
        </div>
      </section>

      <section className="form-tarjeta__section">
        <div className="form-tarjeta__section-header">
          <span>2.</span>
          <h3>{t('registerWordForm.assignment.title')}</h3>
        </div>

        <p className="form-tarjeta__helper">
          {t('registerWordForm.assignment.helper')}
        </p>

        <div className="form-field">
          <label htmlFor="mazo_id" className="form-label--obligatorio">
            {t('registerWordForm.assignment.deck')}
          </label>
          <select
            id="mazo_id"
            name="mazo_id"
            value={form.mazo_id}
            onChange={handleChange}
          >
            <option value="">{t('registerWordForm.assignment.selectDeck')}</option>

            {mazos.map((mazo) => (
              <option key={mazo.id_mazo} value={mazo.id_mazo}>
                {mazo.nombre_lectura}
              </option>
            ))}
          </select>

          {mazosCargados && mazos.length === 0 && (
            <p className="form-tarjeta__helper" role="status">
              {t('registerWordForm.assignment.noOpenDecks')}
            </p>
          )}
        </div>
      </section>

      <div className="form-tarjeta__notice">
        <strong>{t('registerWordForm.reviewNotice.title')}</strong>
        <p>{t('registerWordForm.reviewNotice.text')}</p>
      </div>

      <div className="form-tarjeta__footer">
        {onCerrar && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCerrar}
          >
            {t('registerWordForm.actions.cancel')}
          </button>
        )}

        <button type="submit" className="btn btn-primary">
          {t('registerWordForm.actions.submit')}
        </button>
      </div>
    </form>
  );
}