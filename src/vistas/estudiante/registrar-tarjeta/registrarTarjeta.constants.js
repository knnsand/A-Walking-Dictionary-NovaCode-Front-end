/**
 * @file registrarTarjeta.constants.js
 * @brief Constantes del formulario de registro de palabras.
 */

/** @brief Valores iniciales del formulario. */
export const FORM_INICIAL = {
  mazo_id: '',
  palabra: '',
  traduccion: '',
  definicion: '',
  ejemplo: '',
};

/** @brief Longitud máxima del ejemplo (varchar(150) en la base de datos). */
export const LIMITE_EJEMPLO = 150;