/** Pestañas disponibles en la revisión docente. */
export const TABS = [
  { id: 'nuevos', labelKey: 'reviewPage.tabs.newTerms' },
  { id: 'historial', labelKey: 'reviewPage.tabs.history' },
];

/** Valores persistidos en base de datos: no traducir. */
export const REGISTROS = [
  { value: 'Formal', labelKey: 'registers.formal' },
  { value: 'Informal', labelKey: 'registers.informal' },
  { value: 'Slang', labelKey: 'registers.slang' },
  { value: 'Coloquial', labelKey: 'registers.colloquial' },
  { value: 'Anticuado', labelKey: 'registers.archaic' },
];
export const REGISTRO_CLAVES = Object.fromEntries(
  REGISTROS.map(({ value, labelKey }) => [value, labelKey])
);
