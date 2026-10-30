// cliente-api/reportesApi.test.js
// HU-018 y HU-020: rutas, nombres de archivo y validación de ids de los reportes en PDF.

import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

vi.mock('./httpClient', () => ({ apiDescargarArchivo: vi.fn() }));
vi.mock('./mocks/reportesMock', () => ({
  descargarProgresoMock: vi.fn(),
  descargarReporteCursoMock: vi.fn(),
}));

// USE_MOCK se lee al importar, así que cada prueba carga módulos nuevos con su propio entorno.
async function cargarModulos(useMock) {
  vi.resetModules();
  vi.stubEnv('VITE_USE_MOCK', useMock);
  const { apiDescargarArchivo } = await import('./httpClient');
  const mocks = await import('./mocks/reportesMock');
  const api = await import('./reportesApi');
  return { apiDescargarArchivo, ...mocks, ...api };
}

describe('reportesApi', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('exportarReporteCursoPdf (HU-020)', () => {
    it('descarga desde GET /reports/students/export-pdf?curso_id= como course-report-{id}.pdf', async () => {
      const { apiDescargarArchivo, exportarReporteCursoPdf } = await cargarModulos('false');

      await exportarReporteCursoPdf(3);

      expect(apiDescargarArchivo).toHaveBeenCalledWith(
        '/reports/students/export-pdf?curso_id=3',
        'course-report-3.pdf'
      );
    });

    it('acepta el id como texto (viene de la URL)', async () => {
      const { apiDescargarArchivo, exportarReporteCursoPdf } = await cargarModulos('false');

      await exportarReporteCursoPdf('12');

      expect(apiDescargarArchivo).toHaveBeenCalledWith(
        '/reports/students/export-pdf?curso_id=12',
        'course-report-12.pdf'
      );
    });

    it.each([undefined, null, '', '0', '-1', '2.5', 'abc', '3&x=1'])(
      'rechaza el id inválido %p sin llamar al backend',
      async (idInvalido) => {
        const { apiDescargarArchivo, exportarReporteCursoPdf } = await cargarModulos('false');

        await expect(exportarReporteCursoPdf(idInvalido)).rejects.toThrow('Invalid course ID.');
        expect(apiDescargarArchivo).not.toHaveBeenCalled();
      }
    );

    it('con datos simulados (VITE_USE_MOCK=true) descarga el PDF de prueba', async () => {
      const { apiDescargarArchivo, descargarReporteCursoMock, exportarReporteCursoPdf } =
        await cargarModulos('true');

      await exportarReporteCursoPdf(3);

      expect(descargarReporteCursoMock).toHaveBeenCalledWith('3');
      expect(apiDescargarArchivo).not.toHaveBeenCalled();
    });
  });

  describe('exportarProgresoEstudiantePdf (HU-018)', () => {
    it('descarga desde GET /reports/students/:id/progress/export-pdf', async () => {
      const { apiDescargarArchivo, exportarProgresoEstudiantePdf } = await cargarModulos('false');

      await exportarProgresoEstudiantePdf(7);

      expect(apiDescargarArchivo).toHaveBeenCalledWith(
        '/reports/students/7/progress/export-pdf',
        'student-progress-7.pdf'
      );
    });

    it('rechaza un id inválido sin llamar al backend', async () => {
      const { apiDescargarArchivo, exportarProgresoEstudiantePdf } = await cargarModulos('false');

      await expect(exportarProgresoEstudiantePdf('x')).rejects.toThrow('Invalid student ID.');
      expect(apiDescargarArchivo).not.toHaveBeenCalled();
    });

    it('con datos simulados descarga el PDF de prueba', async () => {
      const { descargarProgresoMock, exportarProgresoEstudiantePdf } = await cargarModulos('true');

      await exportarProgresoEstudiantePdf(7);

      expect(descargarProgresoMock).toHaveBeenCalledWith('7');
    });
  });
});
