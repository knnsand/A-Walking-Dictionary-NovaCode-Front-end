// cliente-api/httpClient.test.js
// apiRequest: cabeceras, token y manejo de errores. `fetch` se simula: no se toca la red.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './httpClient';

const TOKEN_KEY = 'walking_dictionary_token';

/** Respuesta simulada de fetch. */
function respuesta({ ok = true, status = 200, cuerpo = {}, jsonFalla = false } = {}) {
  return {
    ok,
    status,
    json: jsonFalla
      ? vi.fn().mockRejectedValue(new Error('no es JSON'))
      : vi.fn().mockResolvedValue(cuerpo),
  };
}

describe('apiRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('llama a fetch con la ruta y devuelve el JSON de la respuesta', async () => {
    fetch.mockResolvedValue(respuesta({ cuerpo: { id: 1 } }));

    const datos = await apiRequest('/decks');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toMatch(/\/decks$/);
    expect(datos).toEqual({ id: 1 });
  });

  it('envía Content-Type JSON y no manda Authorization si no hay token', async () => {
    fetch.mockResolvedValue(respuesta());

    await apiRequest('/decks');

    const { headers } = fetch.mock.calls[0][1];
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers.Authorization).toBeUndefined();
  });

  it('agrega Authorization Bearer cuando hay token guardado', async () => {
    localStorage.setItem(TOKEN_KEY, 'abc123');
    fetch.mockResolvedValue(respuesta());

    await apiRequest('/decks');

    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer abc123');
  });

  it('conserva el método y el body, y deja que quien llama agregue o cambie cabeceras', async () => {
    localStorage.setItem(TOKEN_KEY, 'abc123');
    fetch.mockResolvedValue(respuesta());

    await apiRequest('/decks', {
      method: 'POST',
      body: '{"a":1}',
      headers: { Authorization: 'Bearer otro', 'X-Extra': 'si' },
    });

    const opciones = fetch.mock.calls[0][1];
    expect(opciones.method).toBe('POST');
    expect(opciones.body).toBe('{"a":1}');
    expect(opciones.headers.Authorization).toBe('Bearer otro');
    expect(opciones.headers['X-Extra']).toBe('si');
  });

  it('si el backend responde un error, lanza el mensaje del backend con status y cuerpo', async () => {
    const cuerpo = { error: 'Mazo no encontrado' };
    fetch.mockResolvedValue(respuesta({ ok: false, status: 404, cuerpo }));

    const error = await apiRequest('/decks/9').catch((e) => e);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Mazo no encontrado');
    expect(error.status).toBe(404);
    expect(error.cuerpo).toEqual(cuerpo);
  });

  it('si el error no trae mensaje, usa uno genérico con el status y la ruta', async () => {
    fetch.mockResolvedValue(respuesta({ ok: false, status: 400, cuerpo: { detalle: 'x' } }));

    const error = await apiRequest('/decks').catch((e) => e);

    expect(error.message).toBe('Error 400 when calling /decks');
    expect(error.cuerpo).toEqual({ detalle: 'x' });
  });

  it('si el error no viene en JSON, usa el mensaje genérico y deja el cuerpo en null', async () => {
    fetch.mockResolvedValue(respuesta({ ok: false, status: 500, jsonFalla: true }));

    const error = await apiRequest('/decks').catch((e) => e);

    expect(error.message).toBe('Error 500 when calling /decks');
    expect(error.status).toBe(500);
    expect(error.cuerpo).toBeNull();
  });

  it.each(['//evil.com/x', 'https://evil.com', 'decks', '/../admin', '/a\\b', '/a?next=http://x'])(
    'rechaza la ruta no relativa %s sin llamar a fetch',
    async (ruta) => {
      await expect(apiRequest(ruta)).rejects.toThrow('Invalid request path');
      expect(fetch).not.toHaveBeenCalled();
    },
  );
});
