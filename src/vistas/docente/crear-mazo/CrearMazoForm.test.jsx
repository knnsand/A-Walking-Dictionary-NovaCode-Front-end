import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CrearMazoForm } from './CrearMazoForm';

vi.mock('../../../contexto/useAuth', () => ({
  useAuth: () => ({ docenteId: 1, rol: 'docente' }),
}));

vi.mock('../../../cliente-api/cursosApi', () => ({
  listarCursos: vi.fn().mockResolvedValue([
    { id_curso: 1, nombre: 'Literatura Anglófona - Grupo 1' },
  ]),
}));

vi.mock('../../../cliente-api/mazosApi', () => ({
  crearMazo: vi.fn().mockResolvedValue({
    id_mazo: 1,
    nombre_lectura: 'Things Fall Apart',
    autor: 'Chinua Achebe',
  }),
}));

describe('CrearMazoForm', () => {
  it('muestra un error si se envía sin completar los campos obligatorios', async () => {
    render(<CrearMazoForm />);
    fireEvent.click(screen.getByRole('button', { name: /create deck/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/complete all required fields/i);
  });

  it('crea el mazo y muestra un mensaje de éxito cuando el formulario está completo', async () => {
    render(<CrearMazoForm />);

    await waitFor(() => screen.getByRole('option', { name: /literatura anglófona/i }));

    fireEvent.change(screen.getByLabelText(/course\/group/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/week\/period/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/literary work/i), { target: { value: 'Things Fall Apart' } });
    fireEvent.change(screen.getByLabelText(/author/i), { target: { value: 'Chinua Achebe' } });
    fireEvent.change(screen.getByLabelText(/opening date/i), { target: { value: '2026-09-08' } });
    fireEvent.change(screen.getByLabelText(/closing date/i), { target: { value: '2026-09-14' } });

    fireEvent.click(screen.getByRole('button', { name: /create deck/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/created successfully/i);
  });

  it('muestra un error si no se completan las fechas (ahora obligatorias)', async () => {
    render(<CrearMazoForm />);

    await waitFor(() =>
      screen.getByRole('option', { name: /literatura anglófona/i })
    );

    fireEvent.change(screen.getByLabelText(/course\/group/i), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/week\/period/i), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText(/literary work/i), {
      target: { value: 'Things Fall Apart' },
    });
    fireEvent.change(screen.getByLabelText(/author/i), {
      target: { value: 'Chinua Achebe' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create deck/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /complete all required fields/i
    );
  });

  it('muestra un error si la fecha de cierre es anterior a la de apertura', async () => {
    render(<CrearMazoForm />);

    await waitFor(() => screen.getByRole('option', { name: /literatura anglófona/i }));

    fireEvent.change(screen.getByLabelText(/course\/group/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/week\/period/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/literary work/i), { target: { value: 'Things Fall Apart' } });
    fireEvent.change(screen.getByLabelText(/author/i), { target: { value: 'Chinua Achebe' } });
    fireEvent.change(screen.getByLabelText(/opening date/i), { target: { value: '2026-09-10' } });
    fireEvent.change(screen.getByLabelText(/closing date/i), { target: { value: '2026-09-05' } });

    fireEvent.click(screen.getByRole('button', { name: /create deck/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/closing date must be the same as or later/i);
  });
});