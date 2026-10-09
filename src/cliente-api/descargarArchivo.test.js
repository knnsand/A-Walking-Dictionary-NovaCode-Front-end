// cliente-api/descargarArchivo.test.js
// HU-3.3: helper que descarga el PDF (blob) y muestra los errores en JSON del backend.

import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { apiDescargarArchivo } from './httpClient';

const TOKEN_KEY = 'walking_dictionary_token';

function respuestaPdf() {
  return {
    ok: true,
    status: 200,
    blob: async () => new Blob(['%PDF-1.7'], { type: 'application/pdf' }),
  };
}

describe('apiDescargarArchivo', () => {
  let fetchMock;
  let clickSpy;

  beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    // jsdom no implementa estas dos funciones.
    URL.createObjectURL = vi.fn(() => 'blob:pdf-falso');
    URL.revokeObjectURL = vi.fn();
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('pide el archivo con el token y dispara la descarga con el nombre indicado', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-docente');
    fetchMock.mockResolvedValue(respuestaPdf());

    await apiDescargarArchivo('/decks/3/export-pdf', 'mazo-3.pdf');

    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/decks\/3\/export-pdf$/);
    expect(opciones.headers.Authorization).toBe('Bearer token-docente');

    expect(clickSpy).toHaveBeenCalledTimes(1);
    const enlace = clickSpy.mock.contexts[0];
    expect(enlace.download).toBe('mazo-3.pdf');
    expect(enlace.href).toBe('blob:pdf-falso');

    // El enlace temporal no queda en el DOM y la URL del blob se libera.
    expect(document.querySelector('a[download]')).toBeNull();
    await vi.waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:pdf-falso'));
  });

  it('no envía Authorization si no hay sesión guardada', async () => {
    fetchMock.mockResolvedValue(respuestaPdf());

    await apiDescargarArchivo('/quizzes/4/export-pdf', 'quiz-4.pdf');

    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
  });

  it('lanza el mensaje de error del backend y no descarga nada', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Mazo no encontrado' }),
    });

    await expect(apiDescargarArchivo('/decks/99/export-pdf', 'mazo-99.pdf')).rejects.toThrow(
      'Mazo no encontrado'
    );
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('usa un mensaje genérico con el código HTTP si el error no viene en JSON', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new SyntaxError('no es JSON');
      },
    });

    await expect(apiDescargarArchivo('/decks/3/export-pdf', 'mazo-3.pdf')).rejects.toThrow(
      'Error 500 al llamar /decks/3/export-pdf'
    );
    expect(clickSpy).not.toHaveBeenCalled();
  });
});
