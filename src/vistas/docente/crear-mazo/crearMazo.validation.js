/**
 * @file crearMazo.validation.js
 * @brief Validaciones del formulario de creación de mazos.
 */

import { CAMPOS_OBLIGATORIOS } from './crearMazo.constants';

/**
 * @brief Verifica que todos los campos obligatorios tengan valor.
 * @param {Object} form - Estado del formulario.
 * @return {boolean} true si no falta ningún campo.
 */
export function validarCamposObligatorios(form) {
  return CAMPOS_OBLIGATORIOS.every(
    campo => String(form[campo]).trim() !== ''
  );
}

/**
 * @brief Verifica que la fecha de cierre no sea anterior a la de apertura.
 * @param {Object} form - Estado del formulario (fecha_apertura y fecha_cierre).
 * @return {boolean} true si las fechas son coherentes.
 */
export function validarFechas(form) {
  return new Date(form.fecha_cierre) >= new Date(form.fecha_apertura);
}