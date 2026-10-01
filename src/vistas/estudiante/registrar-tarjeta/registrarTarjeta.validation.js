import { LIMITE_EJEMPLO } from './registrarTarjeta.constants';

export function validarCamposObligatorios(form) {
  return (
    String(form.palabra).trim() !== '' &&
    String(form.traduccion).trim() !== '' &&
    String(form.definicion).trim() !== ''
  );
}

export function validarEjemplo(ejemplo) {
  return String(ejemplo || '').length <= LIMITE_EJEMPLO;
}

/**
 * Un mazo acepta palabras nuevas si está abierto (el backend responde 409 si está cerrado,
 * CA-1.2.3) y ya llegó su fecha de apertura (la docente puede crear mazos por adelantado).
 * Se compara solo la fecha (YYYY-MM-DD) en la hora local del estudiante.
 */
export function mazoAceptaPalabras(mazo, hoy = new Date().toLocaleDateString('en-CA')) {
  return mazo.estado === 'abierto' && String(mazo.fecha_apertura).slice(0, 10) <= hoy;
}