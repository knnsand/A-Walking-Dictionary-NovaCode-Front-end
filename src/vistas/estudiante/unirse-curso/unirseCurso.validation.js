/**
 * @file unirseCurso.validation.js
 * @brief Validaciones del formulario para unirse a un curso.
 */

import { CAMPOS_OBLIGATORIOS } from './unirseCurso.constants';

/**
 * @brief Verifica que el código de acceso tenga valor.
 * @param {Object} form - Estado del formulario.
 * @return {boolean}
 */
export function validarCamposObligatorios(form) {
  return CAMPOS_OBLIGATORIOS.every((campo) => String(form[campo]).trim() !== '');
}