// Sesión simulada para las pruebas E2E.
//
// El login real es con Google y no se puede automatizar. Se firma un JWT igual al que emite el
// backend (AutenticacionService.emitirSesion: HS256 con JWT_SECRET y { id_usuario, email, rol }) y
// se guarda en localStorage con las mismas claves que AuthProvider.jsx, antes de cargar la página.

import { createHmac } from 'node:crypto';
import { API_URL, JWT_SECRET } from './entorno.js';

/** Usuarios de seed.sql del backend (base recién creada). */
export const USUARIOS = {
  ana: { id_usuario: 1, nombre_completo: 'Ana Docente', email: 'ana.docente@unicauca.edu.co', rol: 'docente' },
  juan: { id_usuario: 2, nombre_completo: 'Juan Estudiante', email: 'juan.estudiante@unicauca.edu.co', rol: 'estudiante' },
  maria: { id_usuario: 3, nombre_completo: 'Maria Estudiante', email: 'maria.estudiante@unicauca.edu.co', rol: 'estudiante' },
  carlos: { id_usuario: 4, nombre_completo: 'Carlos Estudiante', email: 'carlos.estudiante@unicauca.edu.co', rol: 'estudiante' },
  karen: { id_usuario: 6, nombre_completo: 'ksandoval', email: 'ksandoval@unicauca.edu.co', rol: 'estudiante' },
  manuela: { id_usuario: 7, nombre_completo: 'manmeneses', email: 'manmeneses@unicauca.edu.co', rol: 'estudiante' },
};

const base64url = (texto) => Buffer.from(texto).toString('base64url');

/** JWT HS256 firmado con JWT_SECRET (sin dependencias, solo node:crypto). */
export function firmarJwt(usuario, segundos = 3600) {
  const ahora = Math.floor(Date.now() / 1000);
  const cabecera = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const carga = base64url(
    JSON.stringify({ id_usuario: usuario.id_usuario, email: usuario.email, rol: usuario.rol, iat: ahora, exp: ahora + segundos })
  );
  const firma = createHmac('sha256', JWT_SECRET).update(`${cabecera}.${carga}`).digest('base64url');
  return `${cabecera}.${carga}.${firma}`;
}

/**
 * Deja la sesión de `nombre` en localStorage antes de que cargue cualquier página del contexto.
 * @param {import('@playwright/test').BrowserContext} contexto
 */
export async function iniciarSesion(contexto, nombre) {
  const usuario = USUARIOS[nombre];
  const token = firmarJwt(usuario);
  await contexto.addInitScript(
    ([tokenGuardado, usuarioGuardado]) => {
      localStorage.setItem('walking_dictionary_token', tokenGuardado);
      localStorage.setItem('walking_dictionary_usuario', usuarioGuardado);
    },
    [token, JSON.stringify(usuario)]
  );
}

/** Llamada directa a la API como `nombre`, para preparar datos sin pasar por la interfaz. */
export async function api(metodo, ruta, nombre, body) {
  const respuesta = await fetch(`${API_URL}/api/v1${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(nombre ? { Authorization: `Bearer ${firmarJwt(USUARIOS[nombre])}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const cuerpo = (respuesta.headers.get('content-type') || '').includes('json') ? await respuesta.json() : null;
  if (!respuesta.ok) throw new Error(`${metodo} ${ruta} → ${respuesta.status} ${JSON.stringify(cuerpo)}`);
  return cuerpo;
}
