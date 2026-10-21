import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalRegistrarTarjeta } from './registrar-tarjeta/ModalRegistrarTarjeta';
import { ModalUnirseCurso } from './unirse-curso/ModalUnirseCurso';
import { useEncabezadoPagina } from '../../contexto/useEncabezadoPagina';

export function PanelEstudiante() {
  const { t } = useTranslation();
  const [mostrarFormularioTarjeta, setMostrarFormularioTarjeta] = useState(false);
  const [mostrarFormularioUnirse, setMostrarFormularioUnirse] = useState(false);

  // El título de la página lo pinta el layout (barra superior).
  useEncabezadoPagina(t('studentPanel.title'), t('studentPanel.subtitle'));

  return (
    <div className="panel-estudiante">
      <div className="panel-estudiante__acciones">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setMostrarFormularioTarjeta(true)}
        >
          {t('studentPanel.actions.registerWord')}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setMostrarFormularioUnirse(true)}
        >
          {t('studentPanel.actions.joinCourse')}
        </button>
      </div>

      {mostrarFormularioTarjeta && (
        <ModalRegistrarTarjeta onCerrar={() => setMostrarFormularioTarjeta(false)} />
      )}

      {mostrarFormularioUnirse && (
        <ModalUnirseCurso onCerrar={() => setMostrarFormularioUnirse(false)} />
      )}
    </div>
  );
}