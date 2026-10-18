// Variables de entorno de las pruebas E2E (se ejecutan en Node, no en el navegador).
//
// Orden de prioridad: variables del proceso (GitHub Actions) > .env de la raíz del repo de
// infraestructura, cuando este repo está clonado dentro de walking-dictionary-infra (docker compose).
// JWT_SECRET tiene que ser el MISMO que usa el backend que se está probando.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raizFront = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function leerEnv(archivo) {
  if (!existsSync(archivo)) return {};
  const valores = {};
  for (const linea of readFileSync(archivo, 'utf8').split(/\r?\n/)) {
    const coincidencia = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (coincidencia) valores[coincidencia[1]] = coincidencia[2].replace(/^["']|["']$/g, '');
  }
  return valores;
}

const env = { ...leerEnv(path.join(raizFront, '../.env')), ...process.env };

export const FRONT_URL = env.FRONT_URL || 'http://localhost:3000';
export const API_URL = env.API_URL || 'http://localhost:5000';
export const JWT_SECRET = env.JWT_SECRET;
export const DISABLE_AUTH = env.DISABLE_AUTH;

/** Repo del backend: al lado de este en infra, o donde lo descargue el workflow (BACK_REPO). */
export const BACK_REPO = env.BACK_REPO || path.join(raizFront, '../A-Walking-Dictionary-NovaCode-Back-end');
export const CONTENEDOR_DB = env.CONTENEDOR_DB || 'walking_dictionary_db';

/** Conexión para psql en CI (en local se usa el contenedor de docker compose). */
export const DB = {
  host: env.DB_HOST && env.DB_HOST !== 'db' ? env.DB_HOST : 'localhost',
  port: env.DB_PORT || '5432',
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
};
