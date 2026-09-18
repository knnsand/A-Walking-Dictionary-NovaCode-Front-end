import { CAMPOS_OBLIGATORIOS } from './configurarPerfil.constants';

export function validarCamposObligatorios(form) {
  return CAMPOS_OBLIGATORIOS.every((campo) => String(form[campo]).trim() !== '');
}