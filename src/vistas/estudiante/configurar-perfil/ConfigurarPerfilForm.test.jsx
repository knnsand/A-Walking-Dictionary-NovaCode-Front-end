import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfigurarPerfilForm } from './ConfigurarPerfilForm';

vi.mock('../../../contexto/useAuth', () => ({
  useAuth: () => ({ estudianteId: 2, rol: 'estudiante' }),
}));

vi.mock('../../../cliente-api/perfilApi', () => ({
  actualizarPerfil: vi.fn().mockResolvedValue({
    estudiante_id: 2,
    nivel_ingles: 'B1',
    codigo_estudiantil: '20221234',
    avatar: '',
  }),
}));

import { actualizarPerfil } from '../../../cliente-api/perfilApi';

const datosInicialesVacios = { nivel_ingles: '', codigo_estudiantil: '', avatar: '' };

describe('ConfigurarPerfilForm', () => {
  it('muestra un error si se envía sin nivel MCER ni código estudiantil', async () => {
    render(<ConfigurarPerfilForm datosIniciales={datosInicialesVacios} />);
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/nivel mcer.*código estudiantil/i);
  });

  it('actualiza el perfil correctamente cuando los datos son válidos', async () => {
    render(<ConfigurarPerfilForm datosIniciales={datosInicialesVacios} />);
    fireEvent.click(screen.getByRole('radio', { name: /^b1/i }));
    fireEvent.change(screen.getByLabelText(/código estudiantil/i), { target: { value: '20221234' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/perfil actualizado correctamente/i);
    expect(actualizarPerfil).toHaveBeenCalledWith(2, expect.objectContaining({
      nivel_ingles: 'B1',
      codigo_estudiantil: '20221234',
    }));
  });

  it('muestra el mensaje de error que devuelve la API si la actualización falla', async () => {
    actualizarPerfil.mockRejectedValueOnce(new Error('No se pudo actualizar el perfil. Intenta nuevamente.'));
    render(<ConfigurarPerfilForm datosIniciales={datosInicialesVacios} />);
    fireEvent.click(screen.getByRole('radio', { name: /^b1/i }));
    fireEvent.change(screen.getByLabelText(/código estudiantil/i), { target: { value: '20221234' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo actualizar el perfil/i);
  });

  it('precarga el formulario con los datos existentes del estudiante', () => {
    render(<ConfigurarPerfilForm datosIniciales={{ nivel_ingles: 'A2', codigo_estudiantil: '20189876', avatar: '' }} />);
    expect(screen.getByRole('radio', { name: /^a2/i })).toBeChecked();
    expect(screen.getByLabelText(/código estudiantil/i)).toHaveValue('20189876');
  });
});