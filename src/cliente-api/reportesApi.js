
/**
 * HU-018: Reporte de progreso individual del estudiante.
 *
 */

import { apiDescargarArchivo } from './httpClient';
import { USE_MOCK } from './apiConfig';
import { descargarProgresoMock } from './mocks/reportesMock';

export async function exportarProgresoEstudiantePdf(idEstudiante) {
  const id = String(idEstudiante ?? '');

  // Verificar que el ID sea un entero positivo.
  if (!/^[1-9]\d*$/.test(id)) {
    throw new Error('Invalid student ID.');
  }

  // Si los mocks están activos, descargar un PDF de prueba.
  if (USE_MOCK) {
    return descargarProgresoMock(id);
  }

  // Si los mocks están desactivados, llamar al backend.
  return apiDescargarArchivo(
    `/reports/students/${id}/progress/export-pdf`,
    `student-progress-${id}.pdf`,
  );
}
