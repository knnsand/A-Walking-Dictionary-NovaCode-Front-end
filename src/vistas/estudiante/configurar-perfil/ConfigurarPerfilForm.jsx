import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { actualizarPerfil } from '../../../cliente-api/perfilApi';
import { Aviso } from '../../../componentes/comunes/Aviso';
import { NIVELES_MCER, FORM_INICIAL } from './configurarPerfil.constants';
import { validarCamposObligatorios } from './configurarPerfil.validation';

export function ConfigurarPerfilForm({ datosIniciales, onPerfilActualizado }) {
  const { t } = useTranslation();

  const [form, setForm] = useState({ ...FORM_INICIAL, ...datosIniciales });
  const [interesesTexto, setInteresesTexto] = useState((datosIniciales?.intereses || []).join(', '));
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
        mensaje: t('profileForm.errors.invalidData')
      });
      return;
    }

    //if (!estudianteId) {
    //  setAviso({
    
    //  tipo: 'error',
    //  mensaje: 'No hay un estudiante simulado configurado (VITE_ESTUDIANTE_ID_SIMULADO). Revisa tu archivo .env.local.',
    // });
    // return;
    // }

    setEnviando(true);
    try {
      const perfilActualizado = await actualizarPerfil(form);
      setAviso({ tipo: 'exito', mensaje: t('profileForm.success') });
      onPerfilActualizado?.(perfilActualizado);
    } catch (error) {
      // error.message viene del backend y puede estar en español (pendiente de revisar).
      setAviso({ tipo: 'error', mensaje: error.message || t('profileForm.errors.updateFailed') });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Aviso tipo={aviso.tipo} mensaje={aviso.mensaje} />

      <div className="form-group">
        <label className="form-label" htmlFor="avatar">
          {t('profileForm.avatarUrl')}
        </label>

        <input
          id="avatar"
          className="form-input"
          type="url"
          name="avatar"
          value={form.avatar}
          onChange={handleChange}
          placeholder={t('profileForm.avatarPlaceholder')}
        />

        {form.avatar && (
          <img
            src={form.avatar}
            alt={t('profileForm.avatarPreviewAlt')}
            className="perfil__avatar-preview"
            width={80}
            height={80}
          />
        )}
      </div>
      <fieldset className="form-group nivel-mcer-fieldset">
        <legend className="form-label">{t('profileForm.cefrLevel')}</legend>
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
                <span className="nivel-mcer-opcion__descripcion">{t(nivel.descripcionKey)}</span>
                </label>
            </div>
            ))}
        </div>
        </fieldset>

      <div className="form-group">
        <label className="form-label" htmlFor="codigo_estudiantil">{t('profileForm.studentCode')}</label>
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
        {t('profileForm.interests')}
      </label>
      <textarea
        id="intereses"
        className="form-input"
        name="intereses"
        value={interesesTexto}
        onChange={(evento) => {
          const texto = evento.target.value;

          setInteresesTexto(texto);

          const intereses = texto
            .split(',')
            .map((interes) => interes.trim())
            .filter(Boolean);

          setForm((anterior) => ({
            ...anterior,
            intereses,
          }));
        }}
        placeholder={t('profileForm.interestsPlaceholder')}
        rows={3}
      />
    </div>

      <button type="submit" className="btn btn-primary" disabled={enviando}>
        {enviando ? t('profileForm.actions.saving') : t('profileForm.actions.save')}
      </button>
    </form>
  );
}