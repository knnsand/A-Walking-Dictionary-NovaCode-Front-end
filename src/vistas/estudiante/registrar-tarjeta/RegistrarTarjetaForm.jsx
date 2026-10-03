import { useEffect, useState } from 'react';

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

export function RegistrarTarjetaForm({ onCerrar }) {
  const { inscripcionId } = useAuth();
  const [form, setForm] = useState(FORM_INICIAL);
  const [error, setError] = useState('');
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
    setConfirmacion(null);
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
    } catch (error) {
      console.error(error);
      setError(error.message || 'No fue posible procesar la palabra. Intenta nuevamente.');
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
        setExito(
          'Se te registró como coautor: esta palabra ya existía en el mazo con la misma información.'
        );
      } else if (registro.resultado === 'acepcion_nueva') {
        setExito(
          'Acepción adicional registrada correctamente para revisión docente.'
        );
      } else {
        setExito(
          'Palabra enviada correctamente para revisión docente.'
        );
      }

      setForm(FORM_INICIAL);
      setConfirmacion(null);
    } catch (error) {
      console.error(error);
      setError(error.message || 'No fue posible procesar la palabra. Intenta nuevamente.');
    }
  }

  return (
    <form className="form-tarjeta" onSubmit={handleSubmit}>
      <div className="form-tarjeta__header">
        <div>
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

      <p className="form-leyenda-obligatorio">
        Los campos marcados con * son obligatorios.
      </p>

      {confirmacion && (
        <div className="form-tarjeta__notice" role="alert">
          {confirmacion === 'coautoria' ? (
            <>
              <strong>⚠️ Esta palabra ya existe en el mazo, con la misma definición.</strong>
              <p>
                Se te sumará como coautor del aporte existente; no se creará
                una tarjeta nueva.
              </p>
            </>
          ) : (
            <>
              <strong>⚠️ Esta palabra ya existe en el mazo, con una definición distinta.</strong>
              <p>
                Tu aporte se guardará como una acepción adicional, sin
                sobrescribir la existente.
              </p>
            </>
          )}

          <div className="form-tarjeta__footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmacion(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={enviarTarjeta}
            >
              Confirmar y enviar
            </button>
          </div>
        </div>
      )}

      <section className="form-tarjeta__section">
        <div className="form-tarjeta__section-header">
          <span>1.</span>
          <h3>Información léxica</h3>
        </div>

        <div className="form-tarjeta__grid">
          <div className="form-field">
            <label htmlFor="palabra" className="form-label--obligatorio">
              Palabra
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
            <label htmlFor="traduccion" className="form-label--obligatorio">
              Traducción
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
          <label htmlFor="traduccion" className="form-label--obligatorio">
            Traducción
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
          <label htmlFor="mazo_id"className="form-label--obligatorio">
            Mazo de lectura 
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

          {mazosCargados && mazos.length === 0 && (
            <p className="form-tarjeta__helper" role="status">
              No hay mazos abiertos en tus cursos. Si todavía no estás inscrito, únete a un
              curso con el código de acceso que te dé tu docente.
            </p>
          )}
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