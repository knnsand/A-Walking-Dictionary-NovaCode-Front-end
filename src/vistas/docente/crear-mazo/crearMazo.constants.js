/**
 * @file crearMazo.constants.js
 * @brief Constantes del formulario de creación de mazos (HU-001).
 */

/** @brief Variantes regionales del inglés que puede tener un mazo (valor guardado en BD). */
export const VARIANTES_REGIONALES = [
  'Británico',
  'Nigeriano',
  'Jamaicano',
  'Ghanés',
  'Estadounidense',
];

/**
 * @brief Clave de traducción de cada variante regional. El valor en español es el que
 * se guarda en la base de datos y NO cambia; solo se traduce lo que se muestra.
 */
export const VARIANTE_REGIONAL_CLAVES = {
  Británico: 'regionalVariants.british',
  Nigeriano: 'regionalVariants.nigerian',
  Jamaicano: 'regionalVariants.jamaican',
  Ghanés: 'regionalVariants.ghanaian',
  Estadounidense: 'regionalVariants.american',
};

/** @brief Estados posibles de un mazo. */
export const ESTADOS = [
  { value: 'abierto', label: 'Abierto' },
  { value: 'cerrado', label: 'Cerrado' },
];

/**
 * @brief Semanas del semestre (18, según el cronograma del curso). Un mazo no puede
 * crearse fuera de este rango. Cada semana guarda mes y día (sin año); el texto
 * que se muestra se arma en el formulario. Si cambia el semestre, solo hay que
 * actualizar mes y día.
 */
export const SEMANAS_SEMESTRE = [
  { value: '1', mes: 8, dia: 6 },
  { value: '2', mes: 8, dia: 13 },
  { value: '3', mes: 8, dia: 20 },
  { value: '4', mes: 8, dia: 27 },
  { value: '5', mes: 9, dia: 3 },
  { value: '6', mes: 9, dia: 10 },
  { value: '7', mes: 9, dia: 17 },
  { value: '8', mes: 9, dia: 24 },
  { value: '9', mes: 10, dia: 1 },
  { value: '10', mes: 10, dia: 8 },
  { value: '11', mes: 10, dia: 15 },
  { value: '12', mes: 10, dia: 22 },
  { value: '13', mes: 10, dia: 29 },
  { value: '14', mes: 11, dia: 5 },
  { value: '15', mes: 11, dia: 12 },
  { value: '16', mes: 11, dia: 19 },
  { value: '17', mes: 11, dia: 26 },
  { value: '18', mes: 12, dia: 3 },
];

/** @brief Campos que deben estar llenos para crear el mazo. */
export const CAMPOS_OBLIGATORIOS = [
  'curso_id',
  'nombre_lectura',
  'autor',
  'semana',
  'variante_regional_predeterminada',
  'fecha_apertura',
  'fecha_cierre',
];

/** @brief Valores iniciales del formulario. */
export const FORM_INICIAL = {
  curso_id: '',
  nombre_lectura: '',
  autor: '',
  semana: '',
  variante_regional_predeterminada: VARIANTES_REGIONALES[0],
  estado: 'abierto',
  fecha_apertura: '',
  fecha_cierre: '',
};