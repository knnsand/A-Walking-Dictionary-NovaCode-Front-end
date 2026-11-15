// cliente-api/adminUsuariosApi.test.js
// HU-023: listar usuarios, cambiar rol y activar o desactivar cuentas.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './httpClient';
import {
  cambiarEstadoUsuario,
  cambiarRolUsuario,
  listarUsuarios,
  ROLES_ASIGNABLES,
} from './adminUsuariosApi';

vi.mock('./httpClient', () => ({ apiRequest: vi.fn() }));

describe('adminUsuariosApi', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('listarUsuarios sin filtros hace GET /admin/users', async () => {
    const respuesta = { data: [], page: 1, limit: 20, total: 0, total_pages: 0 };
    apiRequest.mockResolvedValue(respuesta);

    const datos = await listarUsuarios();

    expect(apiRequest).toHaveBeenCalledWith('/admin/users', { method: 'GET' });
    expect(datos).toEqual(respuesta);
  });

  it('listarUsuarios envía búsqueda, filtros y página y omite los vacíos', async () => {
    apiRequest.mockResolvedValue({ data: [] });

    await listarUsuarios({ search: 'ana pérez', rol: 'docente', activo: false, page: 2, limit: '' });

    expect(apiRequest).toHaveBeenCalledWith(
      '/admin/users?search=ana+p%C3%A9rez&rol=docente&activo=false&page=2',
      { method: 'GET' }
    );
  });

  it('cambiarRolUsuario hace PATCH /admin/users/:id/role con el rol', async () => {
    apiRequest.mockResolvedValue({ id_usuario: 5, rol: 'docente' });

    const datos = await cambiarRolUsuario(5, 'docente');

    expect(apiRequest).toHaveBeenCalledWith('/admin/users/5/role', {
      method: 'PATCH',
      body: JSON.stringify({ rol: 'docente' }),
    });
    expect(datos.rol).toBe('docente');
  });

  it('cambiarEstadoUsuario hace PATCH /admin/users/:id/status con un booleano', async () => {
    apiRequest.mockResolvedValue({ id_usuario: 5, activo: false });

    await cambiarEstadoUsuario(5, false);

    expect(apiRequest).toHaveBeenCalledWith('/admin/users/5/status', {
      method: 'PATCH',
      body: JSON.stringify({ activo: false }),
    });
  });

  it('no ofrece el rol invitado', () => {
    expect(ROLES_ASIGNABLES).toEqual(['estudiante', 'docente', 'administrador']);
  });
});
