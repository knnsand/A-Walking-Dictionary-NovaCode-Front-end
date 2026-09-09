export const VARIANTES_REGIONALES = [
  'Británico',
  'Nigeriano',
  'Jamaicano',
  'Ghanés',
];

export const ESTADOS = [
  { value: 'abierto', label: 'Abierto' },
  { value: 'cerrado', label: 'Cerrado' },
];

export const CAMPOS_OBLIGATORIOS = [
  'curso_id',
  'nombre_lectura',
  'autor',
  'semana',
  'variante_regional_predeterminada',
  'fecha_apertura',
  'fecha_cierre',
];

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