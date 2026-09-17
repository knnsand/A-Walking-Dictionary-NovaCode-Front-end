import { CAMPOS_OBLIGATORIOS } from './inscribirEstudiante.constants';

export function validarCamposObligatorios(form) {
  return CAMPOS_OBLIGATORIOS.every((campo) => String(form[campo]).trim() !== '');
}

// Validación de formato únicamente -- si el correo existe de verdad lo resuelve el
// mock/backend, no el frontend.
export function validarFormatoEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}