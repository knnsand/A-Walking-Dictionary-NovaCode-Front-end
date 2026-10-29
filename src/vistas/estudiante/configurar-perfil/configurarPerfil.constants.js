/**
 * @file configurarPerfil.constants.js
 * @brief Constantes del formulario de perfil académico.
 */

/** @brief Niveles de inglés del Marco Común Europeo (MCER) y su clave de traducción. */
export const NIVELES_MCER = [
  { value: 'A1', descripcionKey: 'cefrLevels.A1' },
  { value: 'A2', descripcionKey: 'cefrLevels.A2' },
  { value: 'B1', descripcionKey: 'cefrLevels.B1' },
  { value: 'B2', descripcionKey: 'cefrLevels.B2' },
  { value: 'C1', descripcionKey: 'cefrLevels.C1' },
  { value: 'C2', descripcionKey: 'cefrLevels.C2' },
];

/** @brief Valores iniciales del formulario. */
export const FORM_INICIAL = {
  nivel_ingles: '',
  codigo_estudiantil: '',
  avatar: '',
  intereses: [],
};

/**
 * @brief Campos que deben estar llenos para guardar el perfil.
 * @note Deben coincidir con CAMPOS_PERFIL_OBLIGATORIOS de src/contexto/perfilCompleto.js.
 */
export const CAMPOS_OBLIGATORIOS = ['nivel_ingles', 'codigo_estudiantil'];