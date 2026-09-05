import { useState, useEffect } from 'react';
import { listarCursos } from '../../cliente-api/cursosApi';
import { crearMazo } from '../../cliente-api/mazosApi';
import { Aviso } from '../../componentes/comunes/Aviso';

const VARIANTES_REGIONALES = ['Británico', 'Nigeriano', 'Jamaicano', 'Ghanés'];
const ESTADOS = [
  { value: 'abierto', label: 'Abierto' },
  { value: 'cerrado', label: 'Cerrado' },
];

const CAMPOS_OBLIGATORIOS = ['curso_id', 'nombre_lectura', 'autor', 'semana', 'variante_regional_predeterminada', 'fecha_apertura', 'fecha_cierre'];

const FORM_INICIAL = {
  curso_id: '',
  nombre_lectura: '',
  autor: '',
  semana: '',
  variante_regional_predeterminada: VARIANTES_REGIONALES[0],
  estado: 'abierto',
  fecha_apertura: '',
  fecha_cierre: '',
};

export function CrearMazoForm({ onMazoCreado }) {
  const [cursos, setCursos] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarCursos().then(setCursos);
  }, []);

  function handleChange(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  function handleReset() {
    setForm(FORM_INICIAL);
    setAviso({ tipo: null, mensaje: null });
  }

  function validarCamposObligatorios() {
    return CAMPOS_OBLIGATORIOS.every((campo) => String(form[campo]).trim() !== '');
  }

  function validarFechas() {
    if (!form.fecha_apertura || !form.fecha_cierre) return true;
    return new Date(form.fecha_cierre) >= new Date(form.fecha_apertura);
  }

  async function handleSubmit(evento) {
    evento.preventDefault();

    if (!validarCamposObligatorios()) {
      setAviso({ tipo: 'error', mensaje: 'Completa todos los campos obligatorios antes de crear el mazo.' });
      return;
    }

    if (!validarFechas()) {
      setAviso({ tipo: 'error', mensaje: 'La fecha de cierre debe ser igual o posterior a la fecha de apertura.' });
      return;
    }

    setEnviando(true);
    try {
      const mazoCreado = await crearMazo({ ...form, curso_id: Number(form.curso_id) });
      setAviso({ tipo: 'exito', mensaje: `Mazo "${mazoCreado.nombre_lectura}" creado correctamente.` });
      setForm((anterior) => ({ ...anterior, nombre_lectura: '', autor: '', semana: '', fecha_apertura: '', fecha_cierre: '' }));
      onMazoCreado?.(mazoCreado);
    } catch (error) {
      setAviso({ tipo: 'error', mensaje: `No se pudo crear el mazo: ${error.message}` });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="card-mazo" onSubmit={handleSubmit}>
      <div className="card-mazo__header">
        <div className="card-mazo__icon" aria-hidden="true" />
        <div>
          <h2 className="card-mazo__title">Crear Nuevo Mazo de Estudio</h2>
          <p className="card-mazo__subtitle">Herramienta exclusiva de creación para el Docente</p>
        </div>
      </div>

      <div className="card-mazo__body">
        <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="semana">Semana/periodo</label>
            <input id="semana" className="form-input" type="text" name="semana" value={form.semana} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="curso_id">Curso/grupo</label>
            <select id="curso_id" className="form-select" name="curso_id" value={form.curso_id} onChange={handleChange}>
              <option value="">Selecciona un curso</option>
              {cursos.map((curso) => (
                <option key={curso.id_curso} value={curso.id_curso}>{curso.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="nombre_lectura">Obra literaria / lectura asignada</label>
            <input id="nombre_lectura" className="form-input" type="text" name="nombre_lectura" value={form.nombre_lectura} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="autor">Autor</label>
            <input id="autor" className="form-input" type="text" name="autor" value={form.autor} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="fecha_apertura">Fecha de apertura *</label>
            <input id="fecha_apertura" className="form-input" type="date" name="fecha_apertura" value={form.fecha_apertura} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="fecha_cierre">Fecha de cierre *</label>
            <input id="fecha_cierre" className="form-input" type="date" name="fecha_cierre" value={form.fecha_cierre} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <span className="form-label">Variante regional predeterminada</span>
          <div className="chip-group" role="radiogroup" aria-label="Variante regional predeterminada">
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
                <label htmlFor={`variante-${variante}`}>{variante}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <span className="form-label">Estado inicial</span>
          <div className="chip-group" role="radiogroup" aria-label="Estado inicial">
            {ESTADOS.map((opcion) => (
              <div className="chip-option" key={opcion.value}>
                <input
                  type="radio"
                  id={`estado-${opcion.value}`}
                  name="estado"
                  value={opcion.value}
                  checked={form.estado === opcion.value}
                  onChange={handleChange}
                />
                <label htmlFor={`estado-${opcion.value}`}>{opcion.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="info-box">
          Una vez creado el mazo, los estudiantes del curso podrán aportar palabras y ejemplos para tu revisión.
        </div>
      </div>

      <div className="card-mazo__footer">
        <button type="button" className="btn btn-secondary" onClick={handleReset}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Creando...' : 'Crear mazo'}
        </button>
      </div>
    </form>
  );
}