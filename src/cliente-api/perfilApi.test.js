// cliente-api/perfilApi.test.js
// Perfil del estudiante: consultar, actualizar y contexto académico.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './httpClient';
import { actualizarPerfil, obtenerContextoAcademico, obtenerPerfil } from './perfilApi';

vi.mock('./httpClient', () => ({ apiRequest: vi.fn() }));

describe('perfilApi', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('obtenerPerfil hace GET /users/:id', async () => {
    apiRequest.mockResolvedValue({ id_usuario: 6 });

    const datos = await obtenerPerfil(6);

    expect(apiRequest).toHaveBeenCalledWith('/users/6', { method: 'GET' });
    expect(datos).toEqual({ id_usuario: 6 });
  });

  it('actualizarPerfil hace PATCH /users/profile y envía solo los cuatro campos del perfil', async () => {
    apiRequest.mockResolvedValue({ ok: true });

    await actualizarPerfil({
      nivel_ingles: 'B2',
      codigo_estudiantil: '104619',
      avatar: 'avatar-3',
      intereses: ['poesía', 'novela'],
      campo_extra: 'no debe viajar',
    });

    expect(apiRequest).toHaveBeenCalledWith('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        nivel_ingles: 'B2',
        codigo_estudiantil: '104619',
        avatar: 'avatar-3',
        intereses: ['poesía', 'novela'],
      }),
    });
  });

  it('obtenerContextoAcademico hace GET /students/:id/context', async () => {
    apiRequest.mockResolvedValue({ curso: 'Literatura Anglófona' });

    const datos = await obtenerContextoAcademico(6);

    expect(apiRequest).toHaveBeenCalledWith('/students/6/context', { method: 'GET' });
    expect(datos).toEqual({ curso: 'Literatura Anglófona' });
  });

  it('propaga el error del backend', async () => {
    apiRequest.mockRejectedValue(new Error('Usuario no encontrado'));

    await expect(obtenerPerfil(99)).rejects.toThrow('Usuario no encontrado');
  });
});
