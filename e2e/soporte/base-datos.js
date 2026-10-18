// Reinicia la base de datos al estado de init.sql + seed.sql del repo del backend.
//
// - Local (docker compose): psql DENTRO del contenedor walking_dictionary_db.
// - CI (GitHub Actions): psql del runner contra el PostgreSQL de servicio.
// OJO: borra los datos. Nunca apuntar a Supabase.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { BACK_REPO, CONTENEDOR_DB, DB } from './entorno.js';

function sqlDeReinicio() {
  const scripts = ['init.sql', 'seed.sql'].map((archivo) => readFileSync(path.join(BACK_REPO, archivo), 'utf8'));
  return ['DROP SCHEMA public CASCADE; CREATE SCHEMA public;', ...scripts].join('\n');
}

function contenedorCorriendo() {
  try {
    return execFileSync('docker', ['inspect', '-f', '{{.State.Running}}', CONTENEDOR_DB], { stdio: 'pipe' }).toString().trim() === 'true';
  } catch {
    return false;
  }
}

export function reiniciarBaseDeDatos() {
  const opciones = { input: sqlDeReinicio(), stdio: ['pipe', 'ignore', 'pipe'] };

  if (contenedorCorriendo()) {
    execFileSync(
      'docker',
      ['exec', '-i', CONTENEDOR_DB, 'sh', '-c', 'psql -q -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1'],
      opciones
    );
    return;
  }

  if (/supabase/i.test(DB.host)) {
    throw new Error(`DB_HOST apunta a Supabase (${DB.host}): las pruebas no reinician bases remotas.`);
  }
  execFileSync('psql', ['-q', '-v', 'ON_ERROR_STOP=1', '-h', DB.host, '-p', DB.port, '-U', DB.user, '-d', DB.database], {
    ...opciones,
    env: { ...process.env, PGPASSWORD: DB.password },
  });
}
