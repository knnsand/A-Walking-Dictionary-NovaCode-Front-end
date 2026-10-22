// cliente-api/diccionarioApi.test.js
// HU-016: cliente de API del diccionario global (palabras aprobadas).
// `apiRequest` se simula: solo se comprueba la ruta y cómo se interpreta la respuesta.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './httpClient';
import { listarDiccionario, obtenerDetallePalabra } from './diccionarioApi';

vi.mock('./httpClient', () => ({ apiRequest: vi.fn() }));

describe('diccionarioApi', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('listarDiccionario', () => {
    it('CA-16.1: sin término llama a /dictionary y devuelve la lista', async () => {
      apiRequest.mockResolvedValue({ data: [{ id_tarjeta: 1 }, { id_tarjeta: 2 }] });

      const resultado = await listarDiccionario();

      expect(apiRequest).toHaveBeenCalledWith('/dictionary');
      expect(resultado).toEqual([{ id_tarjeta: 1 }, { id_tarjeta: 2 }]);
    });

    it('CA-16.2: con término lo envía como parámetro q, sin espacios sobrantes', async () => {
      apiRequest.mockResolvedValue({ data: [] });

      await listarDiccionario('  wick ');

      expect(apiRequest).toHaveBeenCalledWith('/dictionary?q=wick');
    });

    it('codifica los caracteres especiales del término', async () => {
      apiRequest.mockResolvedValue({ data: [] });

      await listarDiccionario('a&b c');

      expect(apiRequest).toHaveBeenCalledWith('/dictionary?q=a%26b+c');
    });

    it('un término solo con espacios equivale a no buscar', async () => {
      apiRequest.mockResolvedValue({ data: [] });

      await listarDiccionario('   ');

      expect(apiRequest).toHaveBeenCalledWith('/dictionary');
    });

    it('CA-16.3: devuelve una lista vacía cuando no hay resultados', async () => {
      apiRequest.mockResolvedValue({ data: [] });

      await expect(listarDiccionario('zzz')).resolves.toEqual([]);
    });

    it.each([undefined, null, {}, { data: 'x' }])(
      'lanza error si la respuesta no trae una lista en data (%j)',
      async (respuesta) => {
        apiRequest.mockResolvedValue(respuesta);

        await expect(listarDiccionario()).rejects.toThrow('Invalid dictionary response.');
      }
    );
  });

  describe('obtenerDetallePalabra', () => {
    it('consulta el detalle de la tarjeta por id', async () => {
      apiRequest.mockResolvedValue({ id_tarjeta: 7 });

      const detalle = await obtenerDetallePalabra(7);

      expect(apiRequest).toHaveBeenCalledWith('/dictionary/7');
      expect(detalle).toEqual({ id_tarjeta: 7 });
    });

    it('acepta el id como texto numérico', async () => {
      apiRequest.mockResolvedValue({});

      await obtenerDetallePalabra('12');

      expect(apiRequest).toHaveBeenCalledWith('/dictionary/12');
    });

    it.each([0, -3, 1.5, 'abc', null, undefined, NaN])(
      'rechaza el id inválido %s sin llamar al backend',
      async (id) => {
        await expect(obtenerDetallePalabra(id)).rejects.toThrow('Invalid vocabulary card ID.');
        expect(apiRequest).not.toHaveBeenCalled();
      }
    );
  });
});
