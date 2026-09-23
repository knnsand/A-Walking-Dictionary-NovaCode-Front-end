import { useState } from 'react';
import { actualizarPerfil } from '../../../cliente-api/perfilApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { useAuth } from '../../../contexto/useAuth';
import { NIVELES_MCER, FORM_INICIAL } from './configurarPerfil.constants';
import { validarCamposObligatorios } from './configurarPerfil.validation';

export function ConfigurarPerfilForm({ datosIniciales, onPerfilActualizado }) {
  const { estudianteId } = useAuth();
  const [form, setForm] = useState({ ...FORM_INICIAL, ...datosIniciales });
  const [aviso, setAviso] = useState({ tipo: null, mensaje: null });
  const [enviando, setEnviando] = useState(false);

  function handleChange(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  async function handleSubmit(evento) {
    evento.preventDefault();

    if (!validarCamposObligatorios(form)) {
      setAviso({
        tipo: 'error',
        mensaje: 'Revisa los datos del perfil. Verifica tu nivel MCER, código estudiantil, intereses y avatar.'
      });
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
      const perfilActualizado = await actualizarPerfil(estudianteId, form);
      setAviso({ tipo: 'exito', mensaje: 'Perfil actualizado correctamente.' });
      onPerfilActualizado?.(perfilActualizado);
    } catch (error) {
      setAviso({ tipo: 'error', mensaje: error.message || 'No se pudo actualizar el perfil. Intenta nuevamente.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />

      <div className="form-group">
        <label className="form-label" htmlFor="avatar">
          URL del avatar
        </label>

        <input
          id="avatar"
          className="form-input"
          type="url"
          name="avatar"
          value={form.avatar}
          onChange={handleChange}
          placeholder="https://ejemplo.com/avatar.jpg"
        />

        {form.avatar && (
          <img
            src={form.avatar}
            alt="Vista previa del avatar"
            className="perfil__avatar-preview"
            width={80}
            height={80}
          />
        )}
      </div>
      <fieldset className="form-group nivel-mcer-fieldset">
        <legend className="form-label">Nivel MCER</legend>
        <div className="nivel-mcer-grid">
            {NIVELES_MCER.map((nivel) => (
            <div className="nivel-mcer-opcion" key={nivel.value}>
                <input
                type="radio"
                id={`nivel-${nivel.value}`}
                name="nivel_ingles"
                value={nivel.value}
                checked={form.nivel_ingles === nivel.value}
                onChange={handleChange}
                />
                <label htmlFor={`nivel-${nivel.value}`}>
                <span className="nivel-mcer-opcion__codigo">{nivel.value}</span>
                <span className="nivel-mcer-opcion__descripcion">{nivel.descripcion}</span>
                </label>
            </div>
            ))}
        </div>
        </fieldset>

      <div className="form-group">
        <label className="form-label" htmlFor="codigo_estudiantil">Código estudiantil</label>
        <input
          id="codigo_estudiantil"
          className="form-input"
          type="text"
          name="codigo_estudiantil"
          value={form.codigo_estudiantil}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
      <label className="form-label" htmlFor="intereses">
        Intereses
      </label>
      <textarea
        id="intereses"
        className="form-input"
        name="intereses"
        value={(form.intereses || []).join(', ')}
        onChange={(evento) => {
          const intereses = evento.target.value
            .split(',')
            .map((interes) => interes.trim())
            .filter(Boolean);

          setForm((anterior) => ({
            ...anterior,
            intereses,
          }));
        }}
        placeholder="Ejemplo: programación, música, videojuegos"
        rows={3}
      />
    </div>

      <button type="submit" className="btn btn-primary" disabled={enviando}>
        {enviando ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  );
}