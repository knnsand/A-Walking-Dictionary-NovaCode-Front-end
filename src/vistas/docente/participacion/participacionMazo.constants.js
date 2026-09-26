export const TEXTOS = {
  titulo: 'Resumen de Participación por Mazo',
  descripcion:
    'Consulta cuántas palabras y coautorías ha aportado cada estudiante en el mazo semanal seleccionado, y detecta a quienes aún no participan.',
  filtroSinAportes: 'Solo sin aportes',
  botonActualizar: 'Actualizar ahora',
  cargando: 'Cargando participación…',
  sinResultadosFiltro: 'No hay estudiantes que coincidan con este filtro — cumplimiento completo en este mazo.',
  errorGenerico: 'Ocurrió un error inesperado. Intenta de nuevo.',
};

export const COLUMNAS = [
  { key: 'nombre_completo', label: 'Estudiante' },
  { key: 'palabras_aportadas', label: 'Palabras aportadas' },
  { key: 'coautorias', label: 'Coautorías' },
  { key: 'tarjetas_pendientes', label: 'Pendientes' },
  { key: 'tarjetas_aprobadas', label: 'Aprobadas' },
];

// Mismo criterio que usa el backend para el filtro ?sinAportes=true (CA-2.3.2),
// replicado aquí solo para pintar la etiqueta de la fila, no para filtrar en cliente.
export const sinAportesCriterio = (fila) => fila.palabras_aportadas === 0 && fila.coautorias === 0;
