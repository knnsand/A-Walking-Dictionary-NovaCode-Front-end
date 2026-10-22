// cliente-api/analiticasApi.test.js
// HU-006 (HU-2.3): participación de los estudiantes en un mazo. API real y modo mock.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.fn();

async function cargar(usarMock) {
  vi.resetModules();
  vi.doMock('./httpClient', () => ({ apiRequest }));
  vi.doMock('./apiConfig', () => ({ USE_MOCK: usarMock }));
  return import('./analiticasApi');
}

describe('analiticasApi con API real', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('hace GET /teacher/analytics/deck/:id con el token en la cabecera', async () => {
    const { obtenerParticipacionMazo } = await cargar(false);
    apiRequest.mockResolvedValue([{ estudiante_id: 1 }]);

    const datos = await obtenerParticipacionMazo(12, { token: 'jwt-docente' });

    expect(apiRequest).toHaveBeenCalledWith('/teacher/analytics/deck/12', {
      headers: { Authorization: 'Bearer jwt-docente' },
    });
    expect(datos).toEqual([{ estudiante_id: 1 }]);
  });

  it('sin token no manda Authorization', async () => {
    const { obtenerParticipacionMazo } = await cargar(false);
    apiRequest.mockResolvedValue([]);

    await obtenerParticipacionMazo(12);

    expect(apiRequest).toHaveBeenCalledWith('/teacher/analytics/deck/12', { headers: {} });
  });

  it('con sinAportes agrega ?sinAportes=true a la ruta', async () => {
    const { obtenerParticipacionMazo } = await cargar(false);
    apiRequest.mockResolvedValue([]);

    await obtenerParticipacionMazo(12, { sinAportes: true, token: 't' });

    expect(apiRequest.mock.calls[0][0]).toBe('/teacher/analytics/deck/12?sinAportes=true');
  });

  it('propaga el error del backend', async () => {
    const { obtenerParticipacionMazo } = await cargar(false);
    apiRequest.mockRejectedValue(new Error('No tiene permisos para acceder a este recurso'));

    await expect(obtenerParticipacionMazo(12, { token: 't' })).rejects.toThrow(
      'No tiene permisos para acceder a este recurso'
    );
  });
});

describe('analiticasApi con datos simulados (mock)', () => {
  beforeEach(() => {
    apiRequest.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devuelve la participación del mazo 12 (el mock tarda 300 ms) sin llamar al backend', async () => {
    const { obtenerParticipacionMazo } = await cargar(true);

    const promesa = obtenerParticipacionMazo(12);
    await vi.advanceTimersByTimeAsync(300);
    const filas = await promesa;

    expect(filas).toHaveLength(5);
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('con sinAportes deja solo a los estudiantes sin palabras ni coautorías', async () => {
    const { obtenerParticipacionMazo } = await cargar(true);

    const promesa = obtenerParticipacionMazo(12, { sinAportes: true });
    await vi.advanceTimersByTimeAsync(300);
    const filas = await promesa;

    expect(filas.map((f) => f.nombre_completo)).toEqual(['Javier Delgado', 'Laura Erazo']);
  });

  it('rechaza si el id del mazo no es numérico', async () => {
    const { obtenerParticipacionMazo } = await cargar(true);

    const espera = expect(obtenerParticipacionMazo('abc')).rejects.toThrow(
      'El id del mazo debe ser numérico.'
    );
    await vi.advanceTimersByTimeAsync(300);
    await espera;
  });

  it('rechaza si el mazo no existe', async () => {
    const { obtenerParticipacionMazo } = await cargar(true);

    const espera = expect(obtenerParticipacionMazo(99)).rejects.toThrow('Mazo no encontrado.');
    await vi.advanceTimersByTimeAsync(300);
    await espera;
  });
});
