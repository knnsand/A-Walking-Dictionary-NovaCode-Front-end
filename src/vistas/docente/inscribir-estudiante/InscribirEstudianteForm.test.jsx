import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InscribirEstudianteForm } from './InscribirEstudianteForm';

vi.mock('../../../cliente-api/cursosApi', () => ({
  listarCursos: vi.fn().mockResolvedValue([{ id_curso: 1, nombre: 'Literatura Anglófona - Grupo 1' }]),
}));

vi.mock('../../../cliente-api/inscripcionesApi', () => ({
  inscribirEstudiante: vi.fn().mockResolvedValue({
    id_inscripcion: 3,
    curso_id: 1,
    nombre_estudiante: 'Juan Estudiante',
    email_estudiante: 'juan.estudiante@correo.edu',
  }),
}));

import { inscribirEstudiante } from '../../../cliente-api/inscripcionesApi';

describe('InscribirEstudianteForm', () => {
  it('muestra un error si se envía sin completar los campos obligatorios', async () => {
    render(<InscribirEstudianteForm onCerrar={() => {}} />);
    await waitFor(() => screen.getByRole('option', { name: /literatura anglófona/i }));
    fireEvent.click(screen.getByRole('button', { name: /^enroll$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/select a course and enter the student's email/i);
  });

  it('muestra un error si el correo no tiene un formato válido', async () => {
    render(<InscribirEstudianteForm onCerrar={() => {}} />);
    await waitFor(() => screen.getByRole('option', { name: /literatura anglófona/i }));
    fireEvent.change(screen.getByLabelText(/course/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/student email/i), { target: { value: 'no-es-un-correo' } });
    fireEvent.click(screen.getByRole('button', { name: /^enroll$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid format/i);
  });

  it('inscribe al estudiante correctamente cuando los datos son válidos', async () => {
    render(<InscribirEstudianteForm onCerrar={() => {}} />);
    await waitFor(() => screen.getByRole('option', { name: /literatura anglófona/i }));
    fireEvent.change(screen.getByLabelText(/course/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/student email/i), { target: { value: 'juan.estudiante@correo.edu' } });
    fireEvent.click(screen.getByRole('button', { name: /^enroll$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/juan estudiante.*enrolled successfully/i);
    expect(inscribirEstudiante).toHaveBeenCalledWith(1, 'juan.estudiante@correo.edu');
  });
});