// src/contexto/perfilCompleto.js
//
// HU-012: el perfil inicial (perfil académico de HU-013) se solicita hasta
// que el estudiante lo guarda. La decisión sale de los datos en BD
// (GET /api/v1/users/:id), así que aplica a cualquier cuenta y dispositivo,
// y deja de pedirse apenas se guardan los campos obligatorios.
//
// @important Estos campos deben coincidir con CAMPOS_OBLIGATORIOS en
// src/vistas/estudiante/configurar-perfil/configurarPerfil.constants.js.
export const CAMPOS_PERFIL_OBLIGATORIOS = ['nivel_ingles', 'codigo_estudiantil'];

/**
 * @returns {boolean|null} true = completo, false = falta algún campo,
 * null = no se puede saber (respuesta sin esos campos). Con null no se
 * bloquea nada, para no dejar a nadie sin acceso por un dato ausente.
 */
export function calcularPerfilCompleto(perfil) {
  if (!perfil) return null;

  const respuestaTraeCampos = CAMPOS_PERFIL_OBLIGATORIOS.every((campo) => campo in perfil);
  if (!respuestaTraeCampos) return null;

  return CAMPOS_PERFIL_OBLIGATORIOS.every(
    (campo) => String(perfil[campo] ?? '').trim() !== ''
  );
}