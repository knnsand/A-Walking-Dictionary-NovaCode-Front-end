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
    intereses: [],
  }),
}));

import { actualizarPerfil } from '../../../cliente-api/perfilApi';

const datosInicialesVacios = {
  nivel_ingles: '',
  codigo_estudiantil: '',
  avatar: '',
  intereses: [],
};

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

  it('envía los intereses como un arreglo', async () => {
    render(
      <ConfigurarPerfilForm
        datosIniciales={{
          nivel_ingles: '',
          codigo_estudiantil: '',
          avatar: '',
          intereses: [],
        }}
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: /^b1/i }));

    fireEvent.change(
      screen.getByLabelText(/código estudiantil/i),
      { target: { value: '20221234' } }
    );

    fireEvent.change(
      screen.getByLabelText(/intereses/i),
      { target: { value: 'música, programación, videojuegos' } }
    );

    fireEvent.click(
      screen.getByRole('button', { name: /guardar cambios/i })
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /perfil actualizado correctamente/i
    );

    expect(actualizarPerfil).toHaveBeenCalledWith(
      2,
      expect.objectContaining({
        nivel_ingles: 'B1',
        codigo_estudiantil: '20221234',
        intereses: ['música', 'programación', 'videojuegos'],
      })
    );
  });

  it('no permite un código estudiantil de más de 20 caracteres', async () => {
    render(
      <ConfigurarPerfilForm
        datosIniciales={{
          nivel_ingles: '',
          codigo_estudiantil: '',
          avatar: '',
          intereses: [],
        }}
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: /^b1/i }));

    fireEvent.change(
      screen.getByLabelText(/código estudiantil/i),
      {
        target: {
          value: '123456789012345678901',
        },
      }
    );

    fireEvent.click(
      screen.getByRole('button', { name: /guardar cambios/i })
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /revisa los datos del perfil/i
    );

    expect(actualizarPerfil).not.toHaveBeenCalled();
  });
it('no permite un avatar en formato Base64 o data URI', async () => {
    render(
      <ConfigurarPerfilForm
        datosIniciales={{
          nivel_ingles: 'B1',
          codigo_estudiantil: '20221234',
          avatar: 'data:image/png;base64,imagen-falsa',
          intereses: [],
        }}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: /guardar cambios/i })
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /revisa los datos del perfil/i
    );

    expect(actualizarPerfil).not.toHaveBeenCalled();
  });

  it('precarga el formulario con los datos existentes del estudiante', () => {
    render( <ConfigurarPerfilForm datosIniciales={{nivel_ingles: 'A2', codigo_estudiantil: '20189876', avatar: '', intereses: ['música', 'programación'],
        }}
      />
    );
    expect(screen.getByRole('radio', { name: /^a2/i })).toBeChecked();
    expect(screen.getByLabelText(/código estudiantil/i)).toHaveValue('20189876');
  });
});