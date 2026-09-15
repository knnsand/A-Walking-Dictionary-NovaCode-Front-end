import { useEffect, useState } from 'react';

import {
  FORM_INICIAL,
  LIMITE_EJEMPLO,
} from './registrarTarjeta.constants';

import {
  validarCamposObligatorios,
  validarEjemplo,
} from './registrarTarjeta.validation';

import { listarMazos } from '../../../cliente-api/mazosApi';
import { verificarDuplicado, registrarTarjeta } from '../../../cliente-api/tarjetasApi';

export function RegistrarTarjetaForm({ onCerrar }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [mazos, setMazos] = useState([]);

useEffect(() => {
  async function cargarMazos() {
    try {
      const datos = await listarMazos();
      setMazos(datos);
    } catch (error) {
      console.error(error);
      setError('No fue posible cargar los mazos disponibles.');
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

    setError('');
    setExito('');
  }

async function handleSubmit(evento) {
  evento.preventDefault();

  setError('');
  setExito('');

  if (!validarCamposObligatorios(form)) {
    setError(
      'Completa los campos obligatorios: palabra, traducción y definición.'
    );
    return;
  }

  if (!validarEjemplo(form.ejemplo)) {
    setError(
      `El ejemplo no puede superar los ${LIMITE_EJEMPLO} caracteres.`
    );
    return;
  }

  if (!form.mazo_id) {
    setError('Selecciona un mazo para continuar.');
    return;
  }

  try {
    const resultado = await verificarDuplicado(
      Number(form.mazo_id),
      form.palabra,
      form.definicion,
      form.ejemplo
    );

    if (resultado.existe && resultado.tipo === 'coautoria') {
      setError(
        'Esta palabra ya fue aportada en el mazo con la misma información.'
      );
      return;
    }

    const registro = await registrarTarjeta(Number(form.mazo_id), {
      palabra: form.palabra.trim(),
      traduccion: form.traduccion.trim(),
      definicion: form.definicion.trim(),
      ejemplo: form.ejemplo.trim(),
    });

    if (registro.resultado === 'acepcion_nueva') {
      setExito(
        'Acepción adicional registrada correctamente para revisión docente.'
      );
    } else {
      setExito(
        'Palabra enviada correctamente para revisión docente.'
      );
    }
  } catch (error) {
    console.error(error);
    setError('No fue posible procesar la palabra. Intenta nuevamente.');
  }
}

  return (
    <form className="form-tarjeta" onSubmit={handleSubmit}>
      <div className="form-tarjeta__header">
        <div>
          <span className="form-tarjeta__eyebrow">
            LEXICON SCHOLASTIC · APORTE ESTUDIANTIL
          </span>
          <h2>Añadir Nueva Palabra al Mazo</h2>
        </div>

        {onCerrar && (
          <button
            type="button"
            className="btn-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>
        )}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {exito && (
        <p className="form-success" role="status">
          {exito}
        </p>
      )}

      <section className="form-tarjeta__section">
        <div className="form-tarjeta__section-header">
          <span>1.</span>
          <h3>Información léxica</h3>
        </div>

        <div className="form-tarjeta__grid">
          <div className="form-field">
            <label htmlFor="palabra">
              Palabra *
            </label>
            <input
              id="palabra"
              name="palabra"
              type="text"
              value={form.palabra}
              onChange={handleChange}
              placeholder="Ej: Doppelgänger, Sublime..."
            />
          </div>

          <div className="form-field">
            <label htmlFor="traduccion">
              Traducción *
            </label>
            <input
              id="traduccion"
              name="traduccion"
              type="text"
              value={form.traduccion}
              onChange={handleChange}
              placeholder="Ej: Doble"
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="definicion">
            Definición *
          </label>
          <textarea
            id="definicion"
            name="definicion"
            value={form.definicion}
            onChange={handleChange}
            placeholder="Explicación precisa del significado..."
            rows="4"
          />
        </div>

        <div className="form-field">
          <label htmlFor="ejemplo">
            Ejemplo
          </label>
          <textarea
            id="ejemplo"
            name="ejemplo"
            value={form.ejemplo}
            onChange={handleChange}
            placeholder="Escribe una oración que muestre el uso de la palabra..."
            maxLength={LIMITE_EJEMPLO}
            rows="3"
          />

          <small className="form-field__counter">
            {form.ejemplo.length}/{LIMITE_EJEMPLO} caracteres
          </small>
        </div>
      </section>

      <section className="form-tarjeta__section">
        <div className="form-tarjeta__section-header">
          <span>2.</span>
          <h3>Asignación al mazo de lectura</h3>
        </div>

        <p className="form-tarjeta__helper">
          La palabra se incorporará al mazo seleccionado.
        </p>

        <div className="form-field">
          <label htmlFor="mazo_id">
            Mazo de lectura *
          </label>
          <select
            id="mazo_id"
            name="mazo_id"
            value={form.mazo_id}
            onChange={handleChange}
          >
            <option value="">Selecciona un mazo</option>

            {mazos.map((mazo) => (
              <option key={mazo.id_mazo} value={mazo.id_mazo}>
                {mazo.nombre_lectura}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="form-tarjeta__notice">
        <strong>ℹ️ Aporte para revisión docente</strong>
        <p>
          Tu propuesta será enviada al panel de Seguimiento Docente
          para su revisión y aprobación académica.
        </p>
      </div>

      <div className="form-tarjeta__footer">
        {onCerrar && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCerrar}
          >
            Cancelar
          </button>
        )}

        <button type="submit" className="btn btn-primary">
          Enviar palabra para aprobación
        </button>
      </div>
    </form>
  );
}