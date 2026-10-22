// cliente-api/enriquecimientoApi.test.js
// HU-011: sugerencias léxicas (familia de palabras). API real y modo mock.

import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.fn();

async function cargar(usarMock) {
  vi.resetModules();
  vi.doMock('./httpClient', () => ({ apiRequest }));
  vi.doMock('./apiConfig', () => ({ USE_MOCK: usarMock }));
  return import('./enriquecimientoApi');
}

describe('enriquecimientoApi', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('consulta GET /enrichment/family/:palabra con la palabra codificada y sin espacios sobrantes', async () => {
    const { obtenerFamiliaPalabras } = await cargar(false);
    apiRequest.mockResolvedValue({ sugerencias: { noun: { sinonimos: ['book'] } } });

    const datos = await obtenerFamiliaPalabras('  ice cream ');

    expect(apiRequest).toHaveBeenCalledWith('/enrichment/family/ice%20cream');
    expect(datos).toEqual({ sugerencias: { noun: { sinonimos: ['book'] } } });
  });

  it.each([['', 'cadena vacía'], ['   ', 'solo espacios'], [undefined, 'sin palabra']])(
    'lanza error si la palabra es %j (%s)',
    async (palabra) => {
      const { obtenerFamiliaPalabras } = await cargar(false);

      await expect(obtenerFamiliaPalabras(palabra)).rejects.toThrow(
        'Debes indicar una palabra para buscar sugerencias.'
      );
      expect(apiRequest).not.toHaveBeenCalled();
    }
  );

  it('en modo mock devuelve la palabra con sugerencias vacías, sin llamar al backend', async () => {
    const { obtenerFamiliaPalabras } = await cargar(true);

    const datos = await obtenerFamiliaPalabras(' bildungsroman ');

    expect(datos).toEqual({ palabra: 'bildungsroman', sugerencias: [] });
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('propaga el error del backend', async () => {
    const { obtenerFamiliaPalabras } = await cargar(false);
    apiRequest.mockRejectedValue(new Error('WordNet no disponible'));

    await expect(obtenerFamiliaPalabras('foil')).rejects.toThrow('WordNet no disponible');
  });
});
