// cliente-api/authApi.test.js
// Login y registro con Google. `apiRequest` se simula: solo se revisa ruta, método y body.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './httpClient';
import { iniciarSesionConGoogle, registrarConGoogle } from './authApi';

vi.mock('./httpClient', () => ({ apiRequest: vi.fn() }));

describe('authApi', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('iniciarSesionConGoogle hace POST /auth/google con el idToken y devuelve la respuesta', async () => {
    const respuesta = { token: 't', usuario: { id_usuario: 1 } };
    apiRequest.mockResolvedValue(respuesta);

    const datos = await iniciarSesionConGoogle('id-token-google');

    expect(apiRequest).toHaveBeenCalledWith('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken: 'id-token-google' }),
    });
    expect(datos).toEqual(respuesta);
  });

  it('registrarConGoogle hace POST /auth/register con el idToken y devuelve la respuesta', async () => {
    const respuesta = { token: 't', usuario: { id_usuario: 2, rol: 'estudiante' } };
    apiRequest.mockResolvedValue(respuesta);

    const datos = await registrarConGoogle('otro-id-token');

    expect(apiRequest).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ idToken: 'otro-id-token' }),
    });
    expect(datos).toEqual(respuesta);
  });

  it('propaga el error si el backend rechaza el inicio de sesión', async () => {
    apiRequest.mockRejectedValue(new Error('Correo no institucional'));

    await expect(iniciarSesionConGoogle('x')).rejects.toThrow('Correo no institucional');
  });
});
