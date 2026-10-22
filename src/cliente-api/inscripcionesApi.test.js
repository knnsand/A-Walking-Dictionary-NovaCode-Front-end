// cliente-api/inscripcionesApi.test.js
// Inscripciones: el estudiante se une con código (HU-5.3.1) y la docente asigna por correo (HU-5.3.2).

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './httpClient';
import { inscribirEstudiante, unirseCurso } from './inscripcionesApi';

vi.mock('./httpClient', () => ({ apiRequest: vi.fn() }));

describe('inscripcionesApi', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('unirseCurso hace POST /courses/enroll con el código y el id del estudiante', async () => {
    apiRequest.mockResolvedValue({ id_inscripcion: 3 });

    const datos = await unirseCurso('ABC123', 8);

    expect(apiRequest).toHaveBeenCalledWith('/courses/enroll', {
      method: 'POST',
      body: JSON.stringify({ estudiante_id: 8, codigo_acceso: 'ABC123' }),
    });
    expect(datos).toEqual({ id_inscripcion: 3 });
  });

  it('inscribirEstudiante hace POST /courses/:id/assign con el correo', async () => {
    apiRequest.mockResolvedValue({ id_inscripcion: 5 });

    const datos = await inscribirEstudiante(2, 'lucia@unicauca.edu.co');

    expect(apiRequest).toHaveBeenCalledWith('/courses/2/assign', {
      method: 'POST',
      body: JSON.stringify({ email: 'lucia@unicauca.edu.co' }),
    });
    expect(datos).toEqual({ id_inscripcion: 5 });
  });

  it('propaga el error si el código no es válido', async () => {
    apiRequest.mockRejectedValue(new Error('Código de acceso inválido'));

    await expect(unirseCurso('MALO', 8)).rejects.toThrow('Código de acceso inválido');
  });
});
