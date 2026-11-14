import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import {
  beforeEach,
  afterEach,
  afterAll,
  describe,
  it,
  expect,
  vi,
} from 'vitest';

vi.hoisted(() => {
  vi.stubEnv('VITE_ENABLE_COAUTHORSHIP', 'true');
});

vi.mock('../../../contexto/useAuth', () => ({
  useAuth: () => ({ inscripcionId: 44 }),
}));

vi.mock('../../../cliente-api/mazosApi', () => ({
  listarMazos: vi.fn(),
}));

vi.mock('../../../cliente-api/tarjetasApi', () => ({
  verificarDuplicado: vi.fn(),
  registrarTarjeta: vi.fn(),
}));

import { RegistrarTarjetaForm } from './RegistrarTarjetaForm';
import { listarMazos } from '../../../cliente-api/mazosApi';
import {
  verificarDuplicado,
  registrarTarjeta,
} from '../../../cliente-api/tarjetasApi';

async function completarYEnviar() {
  await screen.findByRole('option', { name: 'Beloved' });

  for (const [etiqueta, valor] of [
    [/^Word/, 'wick'],
    [/^Translation/, 'mecha'],
    [/^Definition/, 'The cord of a candle'],
    [/^Reading deck/, '3'],
  ]) {
    fireEvent.change(screen.getByLabelText(etiqueta), {
      target: { value: valor },
    });
  }

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Submit word for approval',
    })
  );
}

describe('RegistrarTarjetaForm con coautorías habilitadas solo en pruebas', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    listarMazos.mockResolvedValue([
      {
        id_mazo: 3,
        estado: 'abierto',
        fecha_apertura: '2020-01-01',
        nombre_lectura: 'Beloved',
      },
    ]);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    {
      resultado: 'coautoria',
      titulo: /with the same definition/,
      mensaje: /You were registered as a co-author/,
    },
    {
      resultado: 'acepcion_nueva',
      titulo: /with a different definition/,
      mensaje: /Additional meaning registered successfully/,
    },
  ])(
    'pide confirmación y registra $resultado',
    async ({ resultado, titulo, mensaje }) => {
      verificarDuplicado.mockResolvedValue({
        duplicado: true,
        ya_enviada: false,
        resultado,
      });

      registrarTarjeta.mockResolvedValue({ resultado });

      render(<RegistrarTarjetaForm />);
      await completarYEnviar();

      expect(await screen.findByRole('alert')).toHaveTextContent(titulo);
      expect(registrarTarjeta).not.toHaveBeenCalled();

      fireEvent.click(
        screen.getByRole('button', { name: 'Confirm and submit' })
      );

      expect(await screen.findByRole('status')).toHaveTextContent(mensaje);

      expect(registrarTarjeta).toHaveBeenCalledTimes(1);
      expect(registrarTarjeta).toHaveBeenCalledWith(3, {
        palabra: 'wick',
        traduccion: 'mecha',
        definicion: 'The cord of a candle',
        ejemplo: '',
        inscripcion_id: 44,
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByLabelText(/^Word/)).toHaveValue('');
    }
  );

  it('cancela la confirmación sin registrar y conserva los campos', async () => {
    verificarDuplicado.mockResolvedValue({
      duplicado: true,
      ya_enviada: false,
      resultado: 'coautoria',
    });

    render(<RegistrarTarjetaForm />);
    await completarYEnviar();
    await screen.findByRole('alert');

    fireEvent.click(
      screen.getByRole('button', { name: 'Cancel', exact: true })
    );

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    expect(registrarTarjeta).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/^Word/)).toHaveValue('wick');
    expect(screen.getByLabelText(/^Definition/)).toHaveValue(
      'The cord of a candle'
    );
  });

  it('descarta la confirmación al modificar la palabra', async () => {
    verificarDuplicado.mockResolvedValue({
      duplicado: true,
      ya_enviada: false,
      resultado: 'coautoria',
    });

    render(<RegistrarTarjetaForm />);
    await completarYEnviar();
    await screen.findByRole('alert');

    fireEvent.change(screen.getByLabelText(/^Word/), {
      target: { value: 'another word' },
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Confirm and submit' })
    ).not.toBeInTheDocument();
    expect(registrarTarjeta).not.toHaveBeenCalled();
  });

  it('bloquea el aporte propio aunque las coautorías estén habilitadas', async () => {
    verificarDuplicado.mockResolvedValue({
      duplicado: true,
      ya_enviada: true,
      resultado: 'coautoria',
    });

    render(<RegistrarTarjetaForm />);
    await completarYEnviar();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You already submitted this word in this deck'
    );

    expect(registrarTarjeta).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'Confirm and submit' })
    ).not.toBeInTheDocument();
  });

  it('registra una palabra nueva sin pedir confirmación', async () => {
    verificarDuplicado.mockResolvedValue({
      duplicado: false,
    });
    registrarTarjeta.mockResolvedValue({
      resultado: 'creada',
    });

    render(<RegistrarTarjetaForm />);
    await completarYEnviar();

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Word submitted successfully for teacher review.'
    );

    expect(registrarTarjeta).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', { name: 'Confirm and submit' })
    ).not.toBeInTheDocument();
  });
});