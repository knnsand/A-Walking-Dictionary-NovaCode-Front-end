// cliente-api/mazosApi.test.js
// Mazos: listar, crear y cambiar estado. Se prueban la API real y los datos simulados (mock).

import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.fn();

/** Carga el módulo de nuevo con el modo mock que se pida (el mock guarda estado en memoria). */
async function cargar(usarMock) {
  vi.resetModules();
  vi.doMock('./httpClient', () => ({ apiRequest }));
  vi.doMock('./apiConfig', () => ({ USE_MOCK: usarMock }));
  return import('./mazosApi');
}

describe('mazosApi con API real', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('listarMazos hace GET /decks', async () => {
    const { listarMazos } = await cargar(false);
    apiRequest.mockResolvedValue([{ id_mazo: 1 }]);

    const datos = await listarMazos();

    expect(apiRequest).toHaveBeenCalledWith('/decks');
    expect(datos).toEqual([{ id_mazo: 1 }]);
  });

  it('crearMazo hace POST /decks con los datos del mazo', async () => {
    const { crearMazo } = await cargar(false);
    const datos = { nombre: 'Semana 1', semana: 1 };
    apiRequest.mockResolvedValue({ id_mazo: 5, ...datos });

    const mazo = await crearMazo(datos);

    expect(apiRequest).toHaveBeenCalledWith('/decks', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
    expect(mazo.id_mazo).toBe(5);
  });

  it('actualizarEstadoMazo hace PATCH /decks/:id/estado con el nuevo estado', async () => {
    const { actualizarEstadoMazo } = await cargar(false);
    apiRequest.mockResolvedValue({ id_mazo: 5, estado: 'cerrado' });

    await actualizarEstadoMazo(5, 'cerrado');

    expect(apiRequest).toHaveBeenCalledWith('/decks/5/estado', {
      method: 'PATCH',
      body: JSON.stringify({ estado: 'cerrado' }),
    });
  });
});

describe('mazosApi con datos simulados (mock)', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('crea un mazo en memoria, lo lista y le cambia el estado, sin llamar al backend', async () => {
    const { actualizarEstadoMazo, crearMazo, listarMazos } = await cargar(true);

    expect(await listarMazos()).toEqual([]);

    const mazo = await crearMazo({ nombre: 'Semana 1', estado: 'abierto' });
    expect(mazo).toMatchObject({ id_mazo: 1, nombre: 'Semana 1' });
    expect(await listarMazos()).toHaveLength(1);

    const actualizado = await actualizarEstadoMazo(1, 'cerrado');
    expect(actualizado.estado).toBe('cerrado');

    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('actualizarEstadoMazo lanza error si el mazo no existe', async () => {
    const { actualizarEstadoMazo } = await cargar(true);

    await expect(actualizarEstadoMazo(99, 'cerrado')).rejects.toThrow('Mazo no encontrado.');
  });
});
