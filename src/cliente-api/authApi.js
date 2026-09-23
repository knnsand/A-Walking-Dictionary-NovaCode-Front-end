import { apiRequest } from './httpClient';

export async function iniciarSesionConGoogle(idToken) {
  return apiRequest('/auth/google', {
    method: 'POST',
    body: JSON.stringify({
      idToken,
    }),
  });
}