import { useState, useEffect } from 'react';
import { listarCursos } from '../../../cliente-api/cursosApi';
import { inscribirEstudiante } from '../../../cliente-api/inscripcionesApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { FORM_INICIAL } from './inscribirEstudiante.constants';
import { validarCamposObligatorios, validarFormatoEmail } from './inscribirEstudiante.validation';

export function InscribirEstudianteForm({ onCerrar, onInscripcionCreada }) {
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

  async function handleSubmit(evento) {
    evento.preventDefault();

    if (!validarCamposObligatorios(form)) {
      setAviso({ tipo: 'error', mensaje: 'Selecciona un curso e ingresa el correo del estudiante.' });
      return;
    }
    if (!validarFormatoEmail(form.email)) {
      setAviso({ tipo: 'error', mensaje: 'Ingresa un correo con un formato válido.' });
      return;
    }

    setEnviando(true);
    try {
      const inscripcion = await inscribirEstudiante(Number(form.curso_id), form.email);
      setAviso({ tipo: 'exito', mensaje: `${inscripcion.nombre_estudiante || 'El estudiante'} quedó inscrito correctamente.` });
      setForm((anterior) => ({ ...anterior, email: '' }));
      onInscripcionCreada?.(inscripcion);
    } catch (error) {
      setAviso({ tipo: 'error', mensaje: error.message || 'No fue posible inscribir al estudiante. Intenta nuevamente.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="card-mazo" onSubmit={handleSubmit} noValidate>
      <div className="card-mazo__header">
        <div>
          <h2 className="card-mazo__title">Inscribir estudiante</h2>
          <p className="card-mazo__subtitle">Vincula a un estudiante existente con uno de tus cursos.</p>
        </div>
        <button type="button" className="card-mazo__close" onClick={onCerrar} aria-label="Cerrar">×</button>
      </div>

      <div className="card-mazo__body">
        <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />
        <div className="form-group">
          <label className="form-label" htmlFor="curso_id">Curso</label>
          <select id="curso_id" className="form-select" name="curso_id" value={form.curso_id} onChange={handleChange}>
            <option value="">Selecciona un curso</option>
            {cursos.map((curso) => (
              <option key={curso.id_curso} value={curso.id_curso}>{curso.nombre}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Correo del estudiante</label>
          <input
            id="email"
            className="form-input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="estudiante@correo.edu"
          />
        </div>
      </div>

      <div className="card-mazo__footer">
        <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Inscribiendo...' : 'Inscribir'}
        </button>
      </div>
    </form>
  );
}