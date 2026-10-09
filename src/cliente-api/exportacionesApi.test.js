// cliente-api/exportacionesApi.test.js
// HU-3.3: rutas y nombres de archivo de las exportaciones a PDF.

import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

vi.mock('./httpClient', () => ({ apiDescargarArchivo: vi.fn() }));

// USE_MOCK se lee al importar, así que cada prueba carga módulos nuevos con su propio entorno.
async function cargarModulos(useMock) {
  vi.resetModules();
  vi.stubEnv('VITE_USE_MOCK', useMock);
  const { apiDescargarArchivo } = await import('./httpClient');
  const api = await import('./exportacionesApi');
  return { apiDescargarArchivo, ...api };
}

describe('exportacionesApi', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exporta el mazo desde GET /decks/:id/export-pdf como mazo-{id}.pdf', async () => {
    const { apiDescargarArchivo, exportarMazoPdf } = await cargarModulos('false');

    await exportarMazoPdf(7);

    expect(apiDescargarArchivo).toHaveBeenCalledWith('/decks/7/export-pdf', 'mazo-7.pdf');
  });

  it('exporta el quiz desde GET /quizzes/:id/export-pdf como quiz-{id}.pdf', async () => {
    const { apiDescargarArchivo, exportarQuizPdf } = await cargarModulos('false');

    await exportarQuizPdf(4);

    expect(apiDescargarArchivo).toHaveBeenCalledWith('/quizzes/4/export-pdf', 'quiz-4.pdf');
  });

  it('con datos simulados (VITE_USE_MOCK=true) avisa en vez de llamar al backend', async () => {
    const { apiDescargarArchivo, exportarMazoPdf, exportarQuizPdf } = await cargarModulos('true');

    await expect(exportarMazoPdf(7)).rejects.toThrow(/datos simulados/);
    await expect(exportarQuizPdf(4)).rejects.toThrow(/datos simulados/);
    expect(apiDescargarArchivo).not.toHaveBeenCalled();
  });
});
