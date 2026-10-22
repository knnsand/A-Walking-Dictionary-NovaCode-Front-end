// vistas/docente/participacion/ParticipacionMazo.test.jsx
// HU-006 (HU-2.3): resumen de participación por mazo, con filtro "sin aportes".

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { ParticipacionMazo } from './ParticipacionMazo';

const logout = vi.fn();

vi.mock('../../../contexto/useAuth', () => ({
  useAuth: () => ({ token: 'tok', logout }),
}));
vi.mock('../../../contexto/useEncabezadoPagina', () => ({ useEncabezadoPagina: vi.fn() }));
vi.mock('../../../cliente-api/analiticasApi', () => ({ obtenerParticipacionMazo: vi.fn() }));
vi.mock('../../../cliente-api/mazosApi', () => ({ listarMazos: vi.fn() }));

import { obtenerParticipacionMazo } from '../../../cliente-api/analiticasApi';
import { listarMazos } from '../../../cliente-api/mazosApi';

const FILAS = [
  {
    estudiante_id: 1,
    nombre_completo: 'Ana Perez',
    palabras_aportadas: 3,
    coautorias: 1,
    tarjetas_pendientes: 1,
    tarjetas_aprobadas: 2,
  },
  {
    estudiante_id: 2,
    nombre_completo: 'Luis Gomez',
    palabras_aportadas: 0,
    coautorias: 0,
    tarjetas_pendientes: 0,
    tarjetas_aprobadas: 0,
  },
];

const MAZOS_PROP = [
  { mazo_id: 10, nombre: 'Week 1 · Beloved' },
  { mazo_id: 11, nombre: 'Week 2 · Kindred' },
];

describe('ParticipacionMazo', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    listarMazos.mockResolvedValue([]);
  });

  it('muestra el estado de carga y luego el resumen y la tabla', async () => {
    obtenerParticipacionMazo.mockResolvedValue(FILAS);
    render(<ParticipacionMazo mazos={MAZOS_PROP} />);

    expect(screen.getByText('Loading participation…')).toBeInTheDocument();

    expect(await screen.findByText('Ana Perez')).toBeInTheDocument();
    expect(screen.getByText('Luis Gomez')).toBeInTheDocument();
    expect(screen.getByText('Participating')).toBeInTheDocument();
    expect(screen.getByText('No contributions')).toBeInTheDocument();
    expect(obtenerParticipacionMazo).toHaveBeenCalledWith(10, { sinAportes: false, token: 'tok' });
  });

  it('calcula las tarjetas de resumen: inscritos, con aporte, palabras y sin aportes', async () => {
    obtenerParticipacionMazo.mockResolvedValue(FILAS);
    render(<ParticipacionMazo mazos={MAZOS_PROP} />);

    await screen.findByText('Ana Perez');

    const valorDe = (etiqueta) => screen.getByText(etiqueta).parentElement.querySelector('strong').textContent;
    expect(valorDe('Enrolled students')).toBe('2');
    expect(valorDe('With at least one contribution')).toBe('1');
    expect(valorDe('Words contributed')).toBe('3');
    expect(valorDe('Without contributions')).toBe('1');
  });

  it('con los mazos por props no consulta el backend para listarlos', async () => {
    obtenerParticipacionMazo.mockResolvedValue(FILAS);
    render(<ParticipacionMazo mazos={MAZOS_PROP} />);

    await screen.findByText('Ana Perez');

    expect(listarMazos).not.toHaveBeenCalled();
    expect(screen.getByRole('option', { name: 'Week 2 · Kindred' })).toBeInTheDocument();
  });

  it('sin props trae los mazos del backend, ordenados por semana', async () => {
    listarMazos.mockResolvedValue([
      { id_mazo: 22, semana: '2', nombre_lectura: 'Kindred' },
      { id_mazo: 21, semana: '1', nombre_lectura: 'Beloved' },
    ]);
    obtenerParticipacionMazo.mockResolvedValue(FILAS);
    render(<ParticipacionMazo />);

    const opciones = await screen.findAllByRole('option');
    await waitFor(() =>
      expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
        'Week 1 · Beloved',
        'Week 2 · Kindred',
      ])
    );
    expect(opciones.length).toBeGreaterThan(0);
    await waitFor(() => expect(obtenerParticipacionMazo).toHaveBeenCalledWith(21, expect.anything()));
  });

  it('si no se pueden traer los mazos conserva el mazo de respaldo', async () => {
    listarMazos.mockRejectedValue(new Error('offline'));
    obtenerParticipacionMazo.mockResolvedValue(FILAS);
    render(<ParticipacionMazo />);

    expect(
      await screen.findByRole('option', { name: 'Week 3 · Their Eyes Were Watching God' })
    ).toBeInTheDocument();
  });

  it('al cambiar de mazo vuelve a pedir la participación del mazo elegido', async () => {
    obtenerParticipacionMazo.mockResolvedValue(FILAS);
    render(<ParticipacionMazo mazos={MAZOS_PROP} />);
    await screen.findByText('Ana Perez');

    fireEvent.change(screen.getByLabelText('Deck'), { target: { value: '11' } });

    await waitFor(() =>
      expect(obtenerParticipacionMazo).toHaveBeenCalledWith('11', { sinAportes: false, token: 'tok' })
    );
  });

  it('CA-2.3.2: el filtro "sin aportes" pide solo esos estudiantes pero conserva las estadísticas completas', async () => {
    obtenerParticipacionMazo.mockImplementation((_id, { sinAportes }) =>
      Promise.resolve(sinAportes ? [FILAS[1]] : FILAS)
    );
    render(<ParticipacionMazo mazos={MAZOS_PROP} />);
    await screen.findByText('Ana Perez');

    fireEvent.click(screen.getByLabelText('Only without contributions'));

    await waitFor(() => expect(screen.queryByText('Ana Perez')).not.toBeInTheDocument());
    expect(screen.getByText('Luis Gomez')).toBeInTheDocument();
    expect(obtenerParticipacionMazo).toHaveBeenCalledWith(10, { sinAportes: true, token: 'tok' });
    expect(screen.getByText('Enrolled students').parentElement.querySelector('strong').textContent).toBe('2');
  });

  it('muestra el mensaje de cumplimiento total cuando el filtro no devuelve estudiantes', async () => {
    obtenerParticipacionMazo.mockResolvedValue([]);
    render(<ParticipacionMazo mazos={MAZOS_PROP} />);

    expect(
      await screen.findByText('No students match this filter — full compliance in this deck.')
    ).toBeInTheDocument();
  });

  it('el botón de actualizar vuelve a consultar el backend', async () => {
    obtenerParticipacionMazo.mockResolvedValue(FILAS);
    render(<ParticipacionMazo mazos={MAZOS_PROP} />);
    await screen.findByText('Ana Perez');

    fireEvent.click(screen.getByRole('button', { name: 'Refresh now' }));

    await waitFor(() => expect(obtenerParticipacionMazo).toHaveBeenCalledTimes(2));
  });

  it('muestra el mensaje del backend cuando la consulta falla', async () => {
    obtenerParticipacionMazo.mockRejectedValue(new Error('Boom'));
    render(<ParticipacionMazo mazos={MAZOS_PROP} />);

    expect(await screen.findByText(/Boom/)).toBeInTheDocument();
    expect(logout).not.toHaveBeenCalled();
  });

  it('con sesión vencida avisa y cierra la sesión', async () => {
    obtenerParticipacionMazo.mockRejectedValue(new Error('Token inválido o expirado'));
    render(<ParticipacionMazo mazos={MAZOS_PROP} />);

    expect(await screen.findByText(/Your session expired\. Please log in again\./)).toBeInTheDocument();
    expect(logout).toHaveBeenCalled();
  });

  it('si la cuenta no es docente lo explica', async () => {
    obtenerParticipacionMazo.mockRejectedValue(
      new Error('No tiene permisos para acceder a este recurso')
    );
    render(<ParticipacionMazo mazos={MAZOS_PROP} />);

    expect(await screen.findByText(/does not have the teacher role/)).toBeInTheDocument();
  });

  it('usa un mensaje genérico si el error no trae texto', async () => {
    obtenerParticipacionMazo.mockRejectedValue({});
    render(<ParticipacionMazo mazos={MAZOS_PROP} />);

    expect(
      await screen.findByText(/An unexpected error occurred\. Please try again\./)
    ).toBeInTheDocument();
  });
});
