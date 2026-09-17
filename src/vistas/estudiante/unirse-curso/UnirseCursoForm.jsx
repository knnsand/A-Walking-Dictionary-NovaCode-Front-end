import { useState } from 'react';
import { unirseCurso } from '../../../cliente-api/inscripcionesApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { useAuth } from '../../../contexto/useAuth';
import { FORM_INICIAL } from './unirseCurso.constants';
import { validarCamposObligatorios } from './unirseCurso.validation';

export function UnirseCursoForm({ onCerrar, onInscripcionCreada }) {
  const { estudianteId } = useAuth();
  const [form, setForm] = useState(FORM_INICIAL);
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });
  const [enviando, setEnviando] = useState(false);

  function handleChange(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  async function handleSubmit(evento) {
    evento.preventDefault();

    if (!validarCamposObligatorios(form)) {
      setAviso({ tipo: 'error', mensaje: 'Ingresa el código de acceso proporcionado por tu docente.' });
      return;
    }

    if (!estudianteId) {
      setAviso({
        tipo: 'error',
        mensaje: 'No hay un estudiante simulado configurado (VITE_ESTUDIANTE_ID_SIMULADO). Revisa tu archivo .env.local.',
      });
      return;
    }

    setEnviando(true);
    try {
      const inscripcion = await unirseCurso(form.codigo_acceso, estudianteId);
      setAviso({ tipo: 'exito', mensaje: 'Te uniste al curso correctamente.' });
      setForm(FORM_INICIAL);
      onInscripcionCreada?.(inscripcion);
    } catch (error) {
      setAviso({ tipo: 'error', mensaje: error.message || 'No fue posible unirte al curso. Intenta nuevamente.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="card-mazo" onSubmit={handleSubmit}>
      <div className="card-mazo__header">
        <div>
          <h2 className="card-mazo__title">Unirme a un curso</h2>
          <p className="card-mazo__subtitle">Ingresa el código que te compartió tu docente.</p>
        </div>
        <button type="button" className="card-mazo__close" onClick={onCerrar} aria-label="Cerrar">×</button>
      </div>

      <div className="card-mazo__body">
        <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />
        <div className="form-group">
          <label className="form-label" htmlFor="codigo_acceso">Código de acceso</label>
          <input
            id="codigo_acceso"
            className="form-input"
            type="text"
            name="codigo_acceso"
            value={form.codigo_acceso}
            onChange={handleChange}
            placeholder="Ej: LIT2026"
          />
        </div>
      </div>

      <div className="card-mazo__footer">
        <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Uniendo...' : 'Unirse a curso'}
        </button>
      </div>
    </form>
  );
}