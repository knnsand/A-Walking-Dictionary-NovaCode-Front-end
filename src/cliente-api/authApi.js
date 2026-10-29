/**
 * @file authApi.js
 * @brief Cliente de autenticación: inicio de sesión y registro con Google.
 */

import { apiRequest } from './httpClient';

/**
 * @brief Inicia sesión con la cuenta de Google del usuario.
 * POST /api/v1/auth/google
 * @param {string} idToken - Token de identidad entregado por Google Sign-In.
 * @return {Promise<{token: string, usuario: Object}>} JWT de la sesión y datos del usuario.
 */
export async function iniciarSesionConGoogle(idToken) {
  return apiRequest('/auth/google', {
    method: 'POST',
    body: JSON.stringify({
      idToken,
    }),
  });
}

/**
 * @brief HU-012 (HU-5.1): registro autónomo de estudiante con Google.
 * POST /api/v1/auth/register — el backend valida que el correo sea
 * institucional y que no exista una cuenta previa; crea el usuario en
 * rol "estudiante" y devuelve la misma forma de respuesta que el login
 * ({ token, usuario }).
 * @param {string} idToken - Token de identidad entregado por Google Sign-In.
 * @return {Promise<{token: string, usuario: Object}>} JWT de la sesión y datos del usuario.
 */
export async function registrarConGoogle(idToken) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      idToken,
    }),
  });
}
