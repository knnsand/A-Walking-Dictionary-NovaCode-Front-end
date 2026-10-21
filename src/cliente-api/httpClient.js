import i18n from '../i18n';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'walking_dictionary_token';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    // Mensaje de respaldo si el backend no trae uno propio.
    let mensaje = i18n.t('api.requestFailed', { status: response.status, path });
    let cuerpo = null;

    try {
      cuerpo = await response.json();

      if (cuerpo?.error) {
        mensaje = cuerpo.error;
      }
    } catch {
      // El cuerpo no era JSON o vino vacío.
    }

    const error = new Error(mensaje);
    error.status = response.status;
    error.cuerpo = cuerpo;
    throw error;
  }

  return response.json();
}