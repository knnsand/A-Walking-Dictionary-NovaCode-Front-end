/**
 * @file inscribirEstudiante.validation.js
 * @brief Validaciones del formulario de inscripción de estudiantes.
 */

import { CAMPOS_OBLIGATORIOS } from './inscribirEstudiante.constants';

/**
 * @brief Verifica que el curso y el correo tengan valor.
 * @param {Object} form - Estado del formulario.
 * @return {boolean} true si no falta ningún campo.
 */
export function validarCamposObligatorios(form) {
  return CAMPOS_OBLIGATORIOS.every((campo) => String(form[campo]).trim() !== '');
}

/**
 * @brief Validación de formato únicamente -- si el correo existe de verdad lo resuelve el
 * mock/backend, no el frontend.
 * @param {string} email - Correo a validar.
 * @return {boolean} true si tiene la forma usuario@dominio.ext sin espacios.
 */
export function validarFormatoEmail(email) {
  const valor = String(email).trim();
  if (/\s/.test(valor)) return false;
  const partes = valor.split('@');
  if (partes.length !== 2) return false;
  const [local, dominio] = partes;
  const punto = dominio.indexOf('.');
  return local.length > 0 && punto > 0 && punto < dominio.length - 1;
}