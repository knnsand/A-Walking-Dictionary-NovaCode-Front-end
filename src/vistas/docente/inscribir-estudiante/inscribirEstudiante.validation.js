import { CAMPOS_OBLIGATORIOS } from './inscribirEstudiante.constants';

export function validarCamposObligatorios(form) {
  return CAMPOS_OBLIGATORIOS.every((campo) => String(form[campo]).trim() !== '');
}

// Validación de formato únicamente -- si el correo existe de verdad lo resuelve el
// mock/backend, no el frontend.
export function validarFormatoEmail(email) {
  const valor = String(email).trim();
  if (/\s/.test(valor)) return false;
  const partes = valor.split('@');
  if (partes.length !== 2) return false;
  const [local, dominio] = partes;
  const punto = dominio.indexOf('.');
  return local.length > 0 && punto > 0 && punto < dominio.length - 1;
}