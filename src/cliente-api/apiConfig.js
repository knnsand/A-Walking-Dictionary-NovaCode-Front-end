/**
 * @file apiConfig.js
 * @brief Configuración compartida de los clientes de la API.
 */

/**
 * @brief Indica si los clientes deben usar datos simulados (mocks) en vez del backend.
 * Se activa con la variable de entorno VITE_USE_MOCK=true.
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';