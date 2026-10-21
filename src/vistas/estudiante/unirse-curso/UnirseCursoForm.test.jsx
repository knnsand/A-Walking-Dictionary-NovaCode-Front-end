import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UnirseCursoForm } from './UnirseCursoForm';

vi.mock('../../../contexto/useAuth', () => ({
  useAuth: () => ({ estudianteId: 2, rol: 'estudiante' }),
}));

vi.mock('../../../cliente-api/inscripcionesApi', () => ({
  unirseCurso: vi.fn().mockResolvedValue({ id_inscripcion: 3, curso_id: 1, estado: 'activo' }),
}));

import { unirseCurso } from '../../../cliente-api/inscripcionesApi';

describe('UnirseCursoForm', () => {
  it('muestra un error si se envía sin completar el código de acceso', async () => {
    render(<UnirseCursoForm onCerrar={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /join course/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/enter the access code/i);
  });

  it('une al estudiante correctamente cuando el código es válido', async () => {
    render(<UnirseCursoForm onCerrar={() => {}} />);
    fireEvent.change(screen.getByLabelText(/access code/i), { target: { value: 'LIT2026' } });
    fireEvent.click(screen.getByRole('button', { name: /join course/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/you joined the course successfully/i);
    expect(unirseCurso).toHaveBeenCalledWith('LIT2026', 2);
  });

  it('muestra el mensaje de error que devuelve la API si el código no es válido', async () => {
    // El mensaje del backend se muestra tal cual (puede estar en español).
    unirseCurso.mockRejectedValueOnce(new Error('El código ingresado no corresponde a ningún curso activo.'));
    render(<UnirseCursoForm onCerrar={() => {}} />);
    fireEvent.change(screen.getByLabelText(/access code/i), { target: { value: 'CODIGO-MALO' } });
    fireEvent.click(screen.getByRole('button', { name: /join course/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/no corresponde a ningún curso activo/i);
  });
});