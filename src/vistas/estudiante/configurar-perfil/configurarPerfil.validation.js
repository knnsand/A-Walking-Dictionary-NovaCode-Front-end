/**
 * @file configurarPerfil.validation.js
 * @brief Validaciones del formulario de perfil académico.
 */

import { CAMPOS_OBLIGATORIOS } from './configurarPerfil.constants';

/**
 * @brief Valida el perfil: campos obligatorios llenos, código estudiantil de máximo 20
 * caracteres, intereses no vacíos y avatar como URL de máximo 500 caracteres (no data:).
 * @param {Object} form - Estado del formulario.
 * @return {boolean} true si el perfil es válido.
 */
export function validarCamposObligatorios(form) {
  const camposObligatoriosValidos = CAMPOS_OBLIGATORIOS.every(
    (campo) => String(form[campo] ?? '').trim() !== ''
  );

  if (!camposObligatoriosValidos) {
    return false;
  }

  if (String(form.codigo_estudiantil).length > 20) {
    return false;
  }

  const intereses = Array.isArray(form.intereses) ? form.intereses : [];

  const interesesValidos = intereses.every(
    (interes) =>
      typeof interes === 'string' &&
      interes.trim() !== ''
  );

  if (!interesesValidos) {
    return false;
  }

  if (form.avatar) {
    if (form.avatar.length > 500) {
      return false;
    }

    if (form.avatar.startsWith('data:')) {
      return false;
    }
  }

  return true;
}