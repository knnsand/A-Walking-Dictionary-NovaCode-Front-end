import { CAMPOS_OBLIGATORIOS } from './unirseCurso.constants';

export function validarCamposObligatorios(form) {
  return CAMPOS_OBLIGATORIOS.every((campo) => String(form[campo]).trim() !== '');
}