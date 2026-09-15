import { CAMPOS_OBLIGATORIOS } from './crearMazo.constants';

export function validarCamposObligatorios(form) {
  return CAMPOS_OBLIGATORIOS.every(
    campo => String(form[campo]).trim() !== ''
  );
}

export function validarFechas(form) {
  return new Date(form.fecha_cierre) >= new Date(form.fecha_apertura);
}