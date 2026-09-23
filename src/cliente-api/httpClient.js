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
    let mensaje = `Error ${response.status} al llamar ${path}`;

    try {
      const cuerpo = await response.json();

      if (cuerpo?.error) {
        mensaje = cuerpo.error;
      }
    } catch {
      // El cuerpo no era JSON o vino vacío.
    }

    throw new Error(mensaje);
  }

  return response.json();
}