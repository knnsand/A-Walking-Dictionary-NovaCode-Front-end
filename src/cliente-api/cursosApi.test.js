// cliente-api/cursosApi.test.js
// Cursos: listar, detalle, código de acceso y estudiantes inscritos.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './httpClient';
import {
  generarCodigoAcceso,
  listarCursos,
  listarEstudiantesCurso,
  obtenerCurso,
} from './cursosApi';

vi.mock('./httpClient', () => ({ apiRequest: vi.fn() }));

describe('cursosApi', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('listarCursos hace GET /courses', async () => {
    const cursos = [{ id_curso: 1, nombre: 'Literatura Anglófona' }];
    apiRequest.mockResolvedValue(cursos);

    const datos = await listarCursos();

    expect(apiRequest).toHaveBeenCalledWith('/courses', { method: 'GET' });
    expect(datos).toEqual(cursos);
  });

  it('obtenerCurso hace GET /courses/:id', async () => {
    apiRequest.mockResolvedValue({ id_curso: 4 });

    const datos = await obtenerCurso(4);

    expect(apiRequest).toHaveBeenCalledWith('/courses/4', { method: 'GET' });
    expect(datos).toEqual({ id_curso: 4 });
  });

  it('generarCodigoAcceso hace POST /courses/:id/access-code', async () => {
    apiRequest.mockResolvedValue({ id_curso: 4, codigo_acceso: 'ABC123' });

    const datos = await generarCodigoAcceso(4);

    expect(apiRequest).toHaveBeenCalledWith('/courses/4/access-code', { method: 'POST' });
    expect(datos.codigo_acceso).toBe('ABC123');
  });

  it('listarEstudiantesCurso hace GET /courses/:id/students', async () => {
    const estudiantes = [{ id_usuario: 7, nombre_completo: 'Lucía Gómez' }];
    apiRequest.mockResolvedValue(estudiantes);

    const datos = await listarEstudiantesCurso(4);

    expect(apiRequest).toHaveBeenCalledWith('/courses/4/students', { method: 'GET' });
    expect(datos).toEqual(estudiantes);
  });

  it('propaga el error del backend', async () => {
    apiRequest.mockRejectedValue(new Error('Curso no encontrado'));

    await expect(obtenerCurso(99)).rejects.toThrow('Curso no encontrado');
  });
});
