// HU-023: pruebas de la gestión de usuarios del administrador (CA-23.1 y CA-23.2).

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GestionUsuarios } from './GestionUsuarios';
import {
  cambiarEstadoUsuario,
  cambiarRolUsuario,
  listarUsuarios,
} from '../../../cliente-api/adminUsuariosApi';

vi.mock('../../../cliente-api/adminUsuariosApi', async (importOriginal) => ({
  ...(await importOriginal()),
  listarUsuarios: vi.fn(),
  cambiarRolUsuario: vi.fn(),
  cambiarEstadoUsuario: vi.fn(),
}));

vi.mock('../../../contexto/useAuth', () => ({
  useAuth: () => ({ idUsuario: 1 }),
}));

vi.mock('../../../contexto/useEncabezadoPagina', () => ({
  useEncabezadoPagina: vi.fn(),
}));

const ADMIN = {
  id_usuario: 1,
  nombre_completo: 'Admin Uno',
  email: 'admin@unicauca.edu.co',
  rol: 'administrador',
  activo: true,
  fecha_registro: '2026-11-01T15:20:00.000Z',
};

const ANA = {
  id_usuario: 5,
  nombre_completo: 'Ana Pérez',
  email: 'ana@unicauca.edu.co',
  rol: 'estudiante',
  activo: true,
  fecha_registro: '2026-11-02T15:20:00.000Z',
};

const LUIS = {
  id_usuario: 7,
  nombre_completo: 'Luis Gómez',
  email: 'luis@unicauca.edu.co',
  rol: 'docente',
  activo: false,
  fecha_registro: null,
};

/** @brief Respuesta paginada como la del backend. */
function pagina(data, extra = {}) {
  return { data, page: 1, limit: 20, total: data.length, total_pages: 1, ...extra };
}

/** @brief Error como el que lanza apiRequest, con el `code` del backend. */
function errorConCodigo(code) {
  const error = new Error('mensaje del backend');
  error.cuerpo = { error: 'mensaje del backend', code };
  return error;
}

function filaDe(nombre) {
  return screen.getByText(nombre).closest('tr');
}

describe('GestionUsuarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CA-23.1: listar y buscar', () => {
    it('muestra un mensaje mientras carga', () => {
      listarUsuarios.mockReturnValue(new Promise(() => {}));
      render(<GestionUsuarios />);

      expect(screen.getByText('Loading users…')).toBeInTheDocument();
    });

    it('lista nombre, correo, rol, estado y fecha de registro', async () => {
      listarUsuarios.mockResolvedValue(pagina([ANA, LUIS]));
      render(<GestionUsuarios />);

      const fila = (await screen.findByText('Ana Pérez')).closest('tr');
      expect(within(fila).getByText('ana@unicauca.edu.co')).toBeInTheDocument();
      expect(within(fila).getByRole('combobox', { name: 'Role of Ana Pérez' })).toHaveValue('estudiante');
      expect(within(fila).getByText('Active')).toBeInTheDocument();
      expect(within(fila).getByText(new Date(ANA.fecha_registro).toLocaleDateString())).toBeInTheDocument();

      const filaLuis = filaDe('Luis Gómez');
      expect(within(filaLuis).getByText('Inactive')).toBeInTheDocument();
      expect(within(filaLuis).getByText('—')).toBeInTheDocument();
      expect(screen.getByText('2 users')).toBeInTheDocument();
      expect(listarUsuarios).toHaveBeenCalledWith({ search: '', rol: '', activo: '', page: 1 });
    });

    it('no ofrece el rol invitado', async () => {
      listarUsuarios.mockResolvedValue(pagina([ANA]));
      render(<GestionUsuarios />);

      const selector = await screen.findByRole('combobox', { name: 'Role of Ana Pérez' });
      const opciones = within(selector).getAllByRole('option').map((opcion) => opcion.value);
      expect(opciones).toEqual(['estudiante', 'docente', 'administrador']);
    });

    it('busca por nombre o correo y filtra por rol y estado', async () => {
      listarUsuarios.mockResolvedValue(pagina([ANA]));
      render(<GestionUsuarios />);
      await screen.findByText('Ana Pérez');

      fireEvent.change(screen.getByLabelText('Search'), { target: { value: '  ana ' } });
      fireEvent.click(screen.getByRole('button', { name: 'Search' }));
      await waitFor(() =>
        expect(listarUsuarios).toHaveBeenLastCalledWith({ search: 'ana', rol: '', activo: '', page: 1 })
      );

      fireEvent.change(screen.getByLabelText('Role', { selector: 'select:not([aria-label])' }), {
        target: { value: 'docente' },
      });
      await waitFor(() =>
        expect(listarUsuarios).toHaveBeenLastCalledWith({ search: 'ana', rol: 'docente', activo: '', page: 1 })
      );

      fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'false' } });
      await waitFor(() =>
        expect(listarUsuarios).toHaveBeenLastCalledWith({
          search: 'ana',
          rol: 'docente',
          activo: 'false',
          page: 1,
        })
      );

      fireEvent.click(await screen.findByRole('button', { name: 'Clear filters' }));
      await waitFor(() =>
        expect(listarUsuarios).toHaveBeenLastCalledWith({ search: '', rol: '', activo: '', page: 1 })
      );
    });

    it('avisa cuando no hay usuarios que coincidan', async () => {
      listarUsuarios.mockResolvedValue(pagina([]));
      render(<GestionUsuarios />);

      expect(await screen.findByText('No users match the current filters.')).toBeInTheDocument();
    });

    it('pagina con anterior y siguiente', async () => {
      listarUsuarios.mockResolvedValue(pagina([ANA], { total: 45, total_pages: 3 }));
      render(<GestionUsuarios />);

      expect(await screen.findByText('Page 1 of 3')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      await waitFor(() => expect(listarUsuarios).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
      expect(await screen.findByText('Page 2 of 3')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
      await waitFor(() => expect(listarUsuarios).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 })));
    });

    it('traduce el error de carga por su código y permite reintentar', async () => {
      listarUsuarios.mockRejectedValueOnce(errorConCodigo('AUTH_FORBIDDEN'));
      listarUsuarios.mockResolvedValueOnce(pagina([ANA]));
      render(<GestionUsuarios />);

      expect(await screen.findByText('Only administrators can manage users.')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
      expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();
    });

    it('usa el mensaje genérico si el error no trae un código conocido', async () => {
      listarUsuarios.mockRejectedValue(new Error('sin red'));
      render(<GestionUsuarios />);

      expect(
        await screen.findByText('The operation could not be completed. Please try again.')
      ).toBeInTheDocument();
    });
  });

  describe('CA-23.2: cambiar rol y estado', () => {
    it('cambia el rol después de confirmar y actualiza la fila', async () => {
      listarUsuarios.mockResolvedValue(pagina([ANA]));
      cambiarRolUsuario.mockResolvedValue({ ...ANA, rol: 'docente' });
      render(<GestionUsuarios />);

      const selector = await screen.findByRole('combobox', { name: 'Role of Ana Pérez' });
      fireEvent.change(selector, { target: { value: 'docente' } });

      expect(window.confirm).toHaveBeenCalledWith('Change the role of Ana Pérez to Teacher?');
      expect(cambiarRolUsuario).toHaveBeenCalledWith(5, 'docente');
      expect(await screen.findByRole('status')).toHaveTextContent('Ana Pérez is now Teacher.');
      expect(selector).toHaveValue('docente');
    });

    it('no envía nada si el administrador cancela la confirmación', async () => {
      window.confirm.mockReturnValue(false);
      listarUsuarios.mockResolvedValue(pagina([ANA]));
      render(<GestionUsuarios />);

      fireEvent.change(await screen.findByRole('combobox', { name: 'Role of Ana Pérez' }), {
        target: { value: 'docente' },
      });
      fireEvent.click(within(filaDe('Ana Pérez')).getByRole('button', { name: 'Deactivate' }));

      expect(cambiarRolUsuario).not.toHaveBeenCalled();
      expect(cambiarEstadoUsuario).not.toHaveBeenCalled();
    });

    it('desactiva y activa cuentas', async () => {
      listarUsuarios.mockResolvedValue(pagina([ANA, LUIS]));
      cambiarEstadoUsuario
        .mockResolvedValueOnce({ ...ANA, activo: false })
        .mockResolvedValueOnce({ ...LUIS, activo: true });
      render(<GestionUsuarios />);
      await screen.findByText('Ana Pérez');

      fireEvent.click(within(filaDe('Ana Pérez')).getByRole('button', { name: 'Deactivate' }));
      expect(window.confirm).toHaveBeenCalledWith(
        'Deactivate the account of Ana Pérez? They will not be able to log in.'
      );
      expect(cambiarEstadoUsuario).toHaveBeenCalledWith(5, false);
      expect(await within(filaDe('Ana Pérez')).findByText('Inactive')).toBeInTheDocument();

      fireEvent.click(within(filaDe('Luis Gómez')).getByRole('button', { name: 'Activate' }));
      expect(cambiarEstadoUsuario).toHaveBeenCalledWith(7, true);
      expect(await screen.findByRole('status')).toHaveTextContent('The account of Luis Gómez was activated.');
    });

    it('muestra la salvaguarda del backend traducida (CA-23.4)', async () => {
      listarUsuarios.mockResolvedValue(pagina([LUIS]));
      cambiarRolUsuario.mockRejectedValue(errorConCodigo('ADMIN_TEACHER_HAS_COURSES'));
      render(<GestionUsuarios />);

      const selector = await screen.findByRole('combobox', { name: 'Role of Luis Gómez' });
      fireEvent.change(selector, { target: { value: 'estudiante' } });

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'This teacher has assigned courses, so their role cannot be changed.'
      );
      expect(selector).toHaveValue('docente');
    });

    it('deshabilita los controles de la cuenta propia', async () => {
      listarUsuarios.mockResolvedValue(pagina([ADMIN, ANA]));
      render(<GestionUsuarios />);

      const fila = (await screen.findByText('Admin Uno')).closest('tr');
      expect(within(fila).getByText('(you)')).toBeInTheDocument();
      expect(within(fila).getByRole('combobox')).toBeDisabled();
      expect(within(fila).getByRole('button', { name: 'Deactivate' })).toBeDisabled();
      expect(within(filaDe('Ana Pérez')).getByRole('combobox')).toBeEnabled();
    });

    it('no llama al backend si se elige el mismo rol', async () => {
      listarUsuarios.mockResolvedValue(pagina([ANA]));
      render(<GestionUsuarios />);

      fireEvent.change(await screen.findByRole('combobox', { name: 'Role of Ana Pérez' }), {
        target: { value: 'estudiante' },
      });

      expect(window.confirm).not.toHaveBeenCalled();
      expect(cambiarRolUsuario).not.toHaveBeenCalled();
    });
  });
});
