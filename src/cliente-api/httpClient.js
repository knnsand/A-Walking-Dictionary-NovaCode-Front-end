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
/**
 * Descarga un archivo binario (p. ej. un PDF) desde el backend y dispara la
 * descarga en el navegador.
 *
 * `apiRequest` no sirve para esto porque siempre interpreta la respuesta como
 * JSON. Aquí, en cambio, la respuesta exitosa es un blob y solo los errores
 * llegan en JSON (`{ "error": "mensaje legible" }`).
 *
 * El nombre del archivo lo define quien llama: el navegador no expone la
 * cabecera Content-Disposition en peticiones CORS por defecto.
 *
 * @param {string} path - Ruta relativa a VITE_API_BASE_URL (ej. `/decks/3/export-pdf`).
 * @param {string} nombreArchivo - Nombre con el que se guarda (ej. `mazo-3.pdf`).
 * @throws {Error} con `.message` listo para mostrar (el `error` del backend si lo hay).
 */
export async function apiDescargarArchivo(path, nombreArchivo) {
  const token = localStorage.getItem(TOKEN_KEY);

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
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

  const blob = await response.blob();
  const urlTemporal = URL.createObjectURL(blob);

  const enlace = document.createElement('a');
  enlace.href = urlTemporal;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  // Se libera después del clic para no cancelar la descarga en algunos navegadores.
  setTimeout(() => URL.revokeObjectURL(urlTemporal), 0);
}
