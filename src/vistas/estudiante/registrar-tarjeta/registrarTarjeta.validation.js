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