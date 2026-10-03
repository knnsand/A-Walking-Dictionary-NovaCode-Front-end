export const VARIANTES_REGIONALES = [
  'Británico',
  'Nigeriano',
  'Jamaicano',
  'Ghanés',
  'Estadounidense',
];

export const ESTADOS = [
  { value: 'abierto', label: 'Abierto' },
  { value: 'cerrado', label: 'Cerrado' },
];

// Semanas del semestre (18, según el cronograma del curso). Un mazo no puede
// crearse fuera de este rango. La fecha de cada semana viene del cronograma
// del semestre actual: si cambia el semestre, solo hay que actualizar los labels.
export const SEMANAS_SEMESTRE = [
  { value: '1', label: 'Semana 1 · 6 de agosto' },
  { value: '2', label: 'Semana 2 · 13 de agosto' },
  { value: '3', label: 'Semana 3 · 20 de agosto' },
  { value: '4', label: 'Semana 4 · 27 de agosto' },
  { value: '5', label: 'Semana 5 · 3 de septiembre' },
  { value: '6', label: 'Semana 6 · 10 de septiembre' },
  { value: '7', label: 'Semana 7 · 17 de septiembre' },
  { value: '8', label: 'Semana 8 · 24 de septiembre' },
  { value: '9', label: 'Semana 9 · 1 de octubre' },
  { value: '10', label: 'Semana 10 · 8 de octubre' },
  { value: '11', label: 'Semana 11 · 15 de octubre' },
  { value: '12', label: 'Semana 12 · 22 de octubre' },
  { value: '13', label: 'Semana 13 · 29 de octubre' },
  { value: '14', label: 'Semana 14 · 5 de noviembre' },
  { value: '15', label: 'Semana 15 · 12 de noviembre' },
  { value: '16', label: 'Semana 16 · 19 de noviembre' },
  { value: '17', label: 'Semana 17 · 26 de noviembre' },
  { value: '18', label: 'Semana 18 · 3 de diciembre' },
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