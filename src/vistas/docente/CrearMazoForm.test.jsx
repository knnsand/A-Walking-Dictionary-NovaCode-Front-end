import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CrearMazoForm } from './CrearMazoForm';

vi.mock('../../cliente-api/cursosApi', () => ({
  listarCursos: vi.fn().mockResolvedValue([{ id_curso: 1, nombre: 'Literatura Anglófona - Grupo 1' }]),
}));

vi.mock('../../cliente-api/mazosApi', () => ({
  crearMazo: vi.fn().mockResolvedValue({
    id_mazo: 1,
    nombre_lectura: 'Things Fall Apart',
    autor: 'Chinua Achebe',
  }),
}));

describe('CrearMazoForm', () => {
  it('muestra un error si se envía sin completar los campos obligatorios', async () => {
    render(<CrearMazoForm />);
    fireEvent.click(screen.getByRole('button', { name: /crear mazo/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/completa todos los campos/i);
  });

  it('crea el mazo y muestra un mensaje de éxito cuando el formulario está completo', async () => {
    render(<CrearMazoForm />);

    await waitFor(() => screen.getByRole('option', { name: /literatura anglófona/i }));

    fireEvent.change(screen.getByLabelText(/curso\/grupo/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/semana\/periodo/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/obra literaria/i), { target: { value: 'Things Fall Apart' } });
    fireEvent.change(screen.getByLabelText(/autor/i), { target: { value: 'Chinua Achebe' } });
    fireEvent.change(screen.getByLabelText(/fecha de apertura/i), { target: { value: '2026-09-08' } });
    fireEvent.change(screen.getByLabelText(/fecha de cierre/i), { target: { value: '2026-09-14' } });

    fireEvent.click(screen.getByRole('button', { name: /crear mazo/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/creado correctamente/i);
  });

  it('muestra un error si la fecha de cierre es anterior a la de apertura', async () => {
    render(<CrearMazoForm />);

    await waitFor(() => screen.getByRole('option', { name: /literatura anglófona/i }));

    fireEvent.change(screen.getByLabelText(/curso\/grupo/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/semana\/periodo/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/obra literaria/i), { target: { value: 'Things Fall Apart' } });
    fireEvent.change(screen.getByLabelText(/autor/i), { target: { value: 'Chinua Achebe' } });
    fireEvent.change(screen.getByLabelText(/fecha de apertura/i), { target: { value: '2026-09-10' } });
    fireEvent.change(screen.getByLabelText(/fecha de cierre/i), { target: { value: '2026-09-05' } });

    fireEvent.click(screen.getByRole('button', { name: /crear mazo/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/fecha de cierre debe ser igual o posterior/i);
  });
});