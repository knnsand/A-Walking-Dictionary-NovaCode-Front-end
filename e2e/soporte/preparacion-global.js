// Se ejecuta UNA vez antes de toda la suite E2E:
//   1. Verifica que front y back respondan y que DISABLE_AUTH no esté activo.
//   2. Reinicia la base al estado de init.sql + seed.sql (ver base-datos.js).
//   3. Completa el perfil de los estudiantes que usan las pruebas (si el perfil está incompleto el
//      front bloquea el menú, HU-012). Carlos se deja sin completar para probar HU-5.2.

import { API_URL, FRONT_URL, JWT_SECRET, DISABLE_AUTH } from './entorno.js';
import { reiniciarBaseDeDatos } from './base-datos.js';
import { api } from './sesion.js';

async function responde(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

export default async function preparacionGlobal() {
  if (!JWT_SECRET) throw new Error('Falta JWT_SECRET (en el .env de infra o como variable de entorno).');
  if (DISABLE_AUTH === 'true') throw new Error('DISABLE_AUTH=true: ponlo en false y reinicia el backend.');
  if (!(await responde(`${API_URL}/health`))) throw new Error(`El backend no responde en ${API_URL}/health.`);
  if (!(await responde(FRONT_URL))) throw new Error(`El frontend no responde en ${FRONT_URL}.`);

  if (process.env.SIN_REINICIO_BD !== 'true') reiniciarBaseDeDatos();

  const perfiles = { juan: '104600001', maria: '104600002', karen: '104600006', manuela: '104600007' };
  for (const [nombre, codigo] of Object.entries(perfiles)) {
    await api('PATCH', '/users/profile', nombre, { nivel_ingles: 'B1', codigo_estudiantil: codigo });
  }
}
