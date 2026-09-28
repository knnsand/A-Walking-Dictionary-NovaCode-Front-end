import { apiRequest } from './httpClient';

export async function iniciarSesionConGoogle(idToken) {
  return apiRequest('/auth/google', {
    method: 'POST',
    body: JSON.stringify({
      idToken,
    }),
  });
}

/**
 * HU-012 (HU-5.1): registro autónomo de estudiante con Google.
 * POST /api/v1/auth/register — el backend valida que el correo sea
 * institucional y que no exista una cuenta previa; crea el usuario en
 * rol "estudiante" y devuelve la misma forma de respuesta que el login
 * ({ token, usuario }).
 */
export async function registrarConGoogle(idToken) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      idToken,
    }),
  });
}
