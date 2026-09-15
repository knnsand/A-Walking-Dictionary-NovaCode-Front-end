const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let mensaje = `Error ${response.status} al llamar ${path}`;
    try {
      const cuerpo = await response.json();
      if (cuerpo?.error) {
        mensaje = cuerpo.error;
      }
    } catch {
      // El cuerpo no era JSON o vino vacío; se conserva el mensaje genérico.
    }
    throw new Error(mensaje);
  }

  return response.json();
}