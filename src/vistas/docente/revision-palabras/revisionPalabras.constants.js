/**
 * Configuración de las pestañas del panel de Revisión de Palabras.
 *
 * Cada objeto define:
 * - id: identificador interno usado en el estado `tabActivo` de
 *   RevisionPalabras.jsx (useState('nuevos')) y en las comparaciones
 *   de renderizado condicional (tabActivo === 'nuevos', etc.).
 * - label: texto visible que ve la docente en la pestaña.
 *
 * Se centraliza aquí (en vez de hardcodear un array dentro del
 * componente) para que agregar, quitar o reordenar pestañas sea un
 * cambio de una sola línea, sin tocar la lógica de RevisionPalabras.jsx.
 */
export const TABS = [
  { id: 'nuevos', label: 'Nuevos Términos' },
  { id: 'coautoria', label: 'Coautoría' },
  { id: 'historial', label: 'Historial Aprobadas' },
];