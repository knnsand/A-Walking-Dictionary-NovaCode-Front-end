// cliente-api/estudioApi.test.js
// HU-010: sesión de repaso y valoración de tarjetas (SM-2).
// Se prueban los dos modos: API real (VITE_USE_MOCK=false) y datos simulados (true).

import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.fn();

/** Carga el módulo de nuevo con el modo mock que se pida. */
async function cargar(usarMock) {
  vi.resetModules();
  vi.doMock('./httpClient', () => ({ apiRequest }));
  vi.doMock('./apiConfig', () => ({ USE_MOCK: usarMock }));
  return import('./estudioApi');
}

describe('estudioApi con API real', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('iniciarSesionRepaso hace POST /study/review-session con la inscripción', async () => {
    const { iniciarSesionRepaso } = await cargar(false);
    apiRequest.mockResolvedValue({ tarjetas: [] });

    const datos = await iniciarSesionRepaso(7);

    expect(apiRequest).toHaveBeenCalledWith('/study/review-session', {
      method: 'POST',
      body: JSON.stringify({ inscripcion_id: 7 }),
    });
    expect(datos).toEqual({ tarjetas: [] });
  });

  it('registrarValoracion hace POST /study/review-session/review con inscripción, tarjeta y valoración', async () => {
    const { registrarValoracion } = await cargar(false);
    apiRequest.mockResolvedValue({ intervalo_dias: 6 });

    const datos = await registrarValoracion(7, 3, 'Buena');

    expect(apiRequest).toHaveBeenCalledWith('/study/review-session/review', {
      method: 'POST',
      body: JSON.stringify({ inscripcion_id: 7, tarjeta_id: 3, valoracion: 'Buena' }),
    });
    expect(datos).toEqual({ intervalo_dias: 6 });
  });

  it('propaga el error del backend', async () => {
    const { iniciarSesionRepaso } = await cargar(false);
    apiRequest.mockRejectedValue(new Error('Inscripción no encontrada'));

    await expect(iniciarSesionRepaso(99)).rejects.toThrow('Inscripción no encontrada');
  });
});

describe('estudioApi con datos simulados (mock)', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('iniciarSesionRepaso devuelve las tarjetas simuladas sin llamar al backend', async () => {
    const { iniciarSesionRepaso } = await cargar(true);

    const datos = await iniciarSesionRepaso('7');

    expect(apiRequest).not.toHaveBeenCalled();
    expect(datos.inscripcion_id).toBe(7);
    expect(datos.total_tarjetas).toBe(datos.tarjetas.length);
    expect(datos.tarjetas.length).toBeGreaterThan(0);
  });

  it('registrarValoracion devuelve un intervalo según la valoración, sin llamar al backend', async () => {
    const { registrarValoracion } = await cargar(true);

    const buena = await registrarValoracion(7, 3, 'Buena');
    const repetir = await registrarValoracion(7, 3, 'Repetir');

    expect(apiRequest).not.toHaveBeenCalled();
    expect(buena).toMatchObject({ inscripcion_id: 7, tarjeta_id: 3, ultima_valoracion: 'Buena' });
    expect(buena.intervalo_dias).toBe(6);
    expect(repetir.intervalo_dias).toBe(1);
  });
});
