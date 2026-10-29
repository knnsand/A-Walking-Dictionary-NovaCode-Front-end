/**
 * @file registrarTarjeta.validation.js
 * @brief Validaciones del formulario de registro de palabras.
 */

import { LIMITE_EJEMPLO } from './registrarTarjeta.constants';

/**
 * @brief Verifica que palabra, traducción y definición tengan valor.
 * @param {Object} form - Estado del formulario.
 * @return {boolean} true si no falta ningún campo.
 */
export function validarCamposObligatorios(form) {
  return (
    String(form.palabra).trim() !== '' &&
    String(form.traduccion).trim() !== '' &&
    String(form.definicion).trim() !== ''
  );
}

/**
 * @brief Verifica que el ejemplo no supere LIMITE_EJEMPLO caracteres.
 * @param {string} [ejemplo] - Ejemplo de uso.
 * @return {boolean}
 */
export function validarEjemplo(ejemplo) {
  return String(ejemplo || '').length <= LIMITE_EJEMPLO;
}

/**
 * @brief Un mazo acepta palabras nuevas si está abierto (el backend responde 409 si está cerrado,
 * CA-1.2.3) y ya llegó su fecha de apertura (la docente puede crear mazos por adelantado).
 * Se compara solo la fecha (YYYY-MM-DD) en la hora local del estudiante.
 * @param {Object} mazo - Mazo con estado y fecha_apertura.
 * @param {string} [hoy] - Fecha de hoy en formato YYYY-MM-DD (se inyecta en las pruebas).
 * @return {boolean}
 */
export function mazoAceptaPalabras(mazo, hoy = new Date().toLocaleDateString('en-CA')) {
  return mazo.estado === 'abierto' && String(mazo.fecha_apertura).slice(0, 10) <= hoy;
}